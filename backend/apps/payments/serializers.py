"""
Serializers for Payment models
"""

from rest_framework import serializers
from .models import PayPalTransaction, Subscription
from apps.users.serializers import UserSerializer
from apps.bookings.serializers import BookingSerializer


class PayPalTransactionSerializer(serializers.ModelSerializer):
    """Serializer for PayPalTransaction model"""
    customer_data = UserSerializer(source='customer', read_only=True)
    seller_data = UserSerializer(source='seller', read_only=True)
    booking_data = BookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = PayPalTransaction
        fields = [
            'id', 'booking', 'booking_data', 'customer', 'customer_data',
            'seller', 'seller_data', 'paypal_transaction_id', 'amount',
            'currency', 'status', 'payer_email', 'receiver_email',
            'order_description', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'customer', 'seller', 'paypal_transaction_id',
            'created_at', 'updated_at'
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model"""
    user_data = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'user_data', 'tier', 'status', 'price',
            'paypal_subscription_id', 'subscription_date', 'renewal_date',
            'cancelled_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'paypal_subscription_id', 'subscription_date',
            'created_at', 'updated_at'
        ]
