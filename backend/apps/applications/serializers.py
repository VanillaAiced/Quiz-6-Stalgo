"""Serializers for applications app."""

from rest_framework import serializers

from .models import SellerApplication


class SellerApplicationSerializer(serializers.ModelSerializer):
    """Serializer for seller applications."""

    class Meta:
        model = SellerApplication
        fields = ['id', 'user', 'status', 'decline_reason', 'created_at']
        read_only_fields = ['id', 'user', 'status', 'decline_reason', 'created_at']
