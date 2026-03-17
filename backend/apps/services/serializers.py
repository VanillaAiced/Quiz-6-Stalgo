"""
Serializers for Service models
"""

from rest_framework import serializers
from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    
    class Meta:
        model = Service
        fields = [
            'id', 'seller', 'service_name', 'description', 'price',
            'duration_of_service', 'sample_image', 'created_at'
        ]
        read_only_fields = ['id', 'seller', 'created_at']
