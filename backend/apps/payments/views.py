"""
Views for Payment management
"""

from django.utils.timezone import now
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import PayPalTransaction, Subscription
from .serializers import PayPalTransactionSerializer, SubscriptionSerializer


class PayPalTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for PayPal transaction tracking"""
    queryset = PayPalTransaction.objects.all()
    serializer_class = PayPalTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'customer', 'seller']
    search_fields = ['paypal_transaction_id', 'order_description']
    ordering_fields = ['amount', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter transactions based on user role"""
        user = self.request.user
        queryset = PayPalTransaction.objects.all()
        
        if user.role == 'admin':
            return queryset
        elif user.role == 'seller':
            # Sellers see payments received
            return queryset.filter(seller=user)
        else:
            # Users see payments made
            return queryset.filter(customer=user)
    
    @action(detail=False, methods=['get'])
    def admin_dashboard(self, request):
        """Admin dashboard with payment statistics"""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transactions = PayPalTransaction.objects.all()
        stats = {
            'total_transactions': transactions.count(),
            'total_revenue': sum(t.amount for t in transactions if t.status == 'completed'),
            'pending_transactions': transactions.filter(status='pending').count(),
            'completed_transactions': transactions.filter(status='completed').count(),
            'failed_transactions': transactions.filter(status='failed').count(),
        }
        
        serializer = PayPalTransactionSerializer(transactions, many=True)
        return Response({
            'stats': stats,
            'transactions': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark transaction as completed (admin only)"""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transaction = self.get_object()
        transaction.status = 'completed'
        transaction.booking.payment_status = 'completed'
        transaction.save()
        transaction.booking.save()
        
        serializer = self.get_serializer(transaction)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for subscription management"""
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tier', 'status', 'user']
    
    def get_queryset(self):
        """Filter subscriptions based on user role"""
        user = self.request.user
        if user.role == 'admin':
            return Subscription.objects.all()
        return Subscription.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def my_subscription(self, request):
        """Get current user's subscription"""
        try:
            subscription = Subscription.objects.get(user=request.user)
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except Subscription.DoesNotExist:
            return Response(
                {'message': 'No active subscription'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def cancel(self, request):
        """Cancel current user's subscription"""
        try:
            subscription = Subscription.objects.get(user=request.user)
            subscription.status = 'cancelled'
            subscription.save()
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'No subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
