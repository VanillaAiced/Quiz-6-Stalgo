"""Views for order creation and user history."""

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderSerializer


class CreateOrderView(generics.CreateAPIView):
    """Create order for the authenticated buyer."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)


class UserOrderHistoryView(generics.ListAPIView):
    """Return order history for the authenticated user."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).select_related('service', 'buyer')
