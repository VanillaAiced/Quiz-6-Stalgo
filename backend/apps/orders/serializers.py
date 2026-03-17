"""Serializers for orders app."""

from rest_framework import serializers

from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for order records."""

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'service', 'paypal_transaction_id', 'price_paid', 'date_purchased']
        read_only_fields = ['id', 'buyer', 'date_purchased']
