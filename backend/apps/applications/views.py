"""Views for seller application lifecycle."""

from django.utils.crypto import get_random_string
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SellerApplication
from .serializers import SellerApplicationSerializer


def _generate_unique_merchant_id():
    """Generate a unique merchant ID for approved sellers."""
    from apps.users.models import CustomUser

    while True:
        merchant_id = f"MER-{get_random_string(8).upper()}"
        if not CustomUser.objects.filter(merchant_id=merchant_id).exists():
            return merchant_id


class SubmitApplicationView(generics.CreateAPIView):
    """Submit a seller application for the current user."""

    serializer_class = SellerApplicationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if SellerApplication.objects.filter(user=request.user).exists():
            return Response(
                {'error': 'You already have a submitted application.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application = SellerApplication.objects.create(user=request.user)
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ListApplicationView(generics.ListAPIView):
    """List applications; admin sees all, others see only their own."""

    serializer_class = SellerApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return SellerApplication.objects.all()
        return SellerApplication.objects.filter(user=user)


class ApproveApplicationView(generics.UpdateAPIView):
    """Approve an application and assign merchant ID to the user."""

    serializer_class = SellerApplicationSerializer
    permission_classes = [IsAuthenticated]
    queryset = SellerApplication.objects.select_related('user').all()

    def patch(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_object()
        application.status = 'approved'
        application.decline_reason = None
        application.save(update_fields=['status', 'decline_reason'])

        seller_user = application.user
        seller_user.role = 'seller'
        if not seller_user.merchant_id:
            seller_user.merchant_id = _generate_unique_merchant_id()
        seller_user.save(update_fields=['role', 'merchant_id'])

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeclineApplicationView(generics.UpdateAPIView):
    """Decline an application with a reason."""

    serializer_class = SellerApplicationSerializer
    permission_classes = [IsAuthenticated]
    queryset = SellerApplication.objects.select_related('user').all()

    def patch(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        decline_reason = request.data.get('decline_reason')
        if not decline_reason:
            return Response(
                {'error': 'decline_reason is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application = self.get_object()
        application.status = 'declined'
        application.decline_reason = decline_reason
        application.save(update_fields=['status', 'decline_reason'])

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
