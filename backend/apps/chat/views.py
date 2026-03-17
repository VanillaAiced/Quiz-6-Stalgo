"""Views for AI chatbot API communication."""

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.subscriptions.models import UserSubscription


CHATBOT_KNOWLEDGE = {
    'services': {
        'keywords': ['service', 'repair', 'appliance', 'available', 'offers'],
        'response': (
            'We offer AC Repair, Washing Machine Service, Refrigerator Service, '
            'and Water Heater Repair. You can browse them at /api/v1/services/list/.'
        ),
    },
    'booking': {
        'keywords': ['book', 'booking', 'schedule', 'appointment'],
        'response': (
            'To book a service, pick a service first, then provide your preferred date, '
            'location, and issue details from the booking screen.'
        ),
    },
    'payment': {
        'keywords': ['payment', 'paypal', 'price', 'cost'],
        'response': (
            'Payments are handled via PayPal. Successful purchases can be logged in '
            'orders through /api/v1/orders/create/.'
        ),
    },
    'subscription': {
        'keywords': ['subscription', 'tier', 'plan', 'usage'],
        'response': (
            'Chatbot usage depends on your active tier: 1st tier = 3, 2nd tier = 5, '
            '3rd tier = 10 messages.'
        ),
    },
    'seller': {
        'keywords': ['seller', 'apply', 'merchant', 'application'],
        'response': (
            'To become a seller, submit an application at /api/v1/applications/apply/. '
            'An admin can approve or decline your submission.'
        ),
    },
}


def generate_bot_response(message):
    """Generate a practical assistant reply from a small domain knowledge base."""

    lower_message = message.lower()
    for data in CHATBOT_KNOWLEDGE.values():
        if any(keyword in lower_message for keyword in data['keywords']):
            return data['response']

    return (
        'I can help with services, bookings, payments, subscriptions, and seller applications. '
        'Try asking about one of those topics.'
    )


class AIChatbotView(APIView):
    """Chat endpoint locked behind active subscription usage limits."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({'error': 'message is required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            subscription = UserSubscription.objects.select_for_update().select_related('tier').filter(
                user=request.user,
                is_active=True,
            ).first()

            if not subscription:
                return Response(
                    {'error': 'Active subscription required to use chatbot.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if subscription.usage_left <= 0:
                return Response(
                    {'error': 'No chatbot usage left for your current subscription.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            assistant_response = generate_bot_response(user_message)
            subscription.usage_left -= 1
            subscription.save(update_fields=['usage_left'])

        return Response(
            {
                'message': user_message,
                'response': assistant_response,
                'reply': assistant_response,
                'usage_left': subscription.usage_left,
                'tier': subscription.tier.name,
            },
            status=status.HTTP_200_OK,
        )
