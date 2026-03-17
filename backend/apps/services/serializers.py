"""
Serializers for Service models
"""

from rest_framework import serializers
from .models import Service, ServiceReview
from apps.users.serializers import UserSerializer


class ServiceReviewSerializer(serializers.ModelSerializer):
    """Serializer for ServiceReview model"""
    customer_data = UserSerializer(source='customer', read_only=True)
    
    class Meta:
        model = ServiceReview
        fields = ['id', 'service', 'customer', 'customer_data', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    seller_data = UserSerializer(source='seller', read_only=True)
    reviews = ServiceReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'seller', 'seller_data', 'name', 'description', 'price',
            'duration', 'image_url', 'image', 'location', 'rating',
            'total_bookings', 'is_active', 'reviews', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating', 'total_bookings', 'created_at', 'updated_at']


class ServiceCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating services"""
    
    class Meta:
        model = Service
        fields = [
            'name', 'description', 'price', 'duration',
            'image_url', 'image', 'location', 'is_active'
        ]
