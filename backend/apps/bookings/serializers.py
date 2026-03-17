"""
Serializers for Booking models
"""

from rest_framework import serializers
from .models import Booking
from apps.services.serializers import ServiceSerializer
from apps.users.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    customer_data = UserSerializer(source='customer', read_only=True)
    service_data = ServiceSerializer(source='service', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'customer_data', 'service', 'service_data',
            'booking_date', 'location', 'property_type', 'appliance_details',
            'issue_description', 'amount', 'status', 'payment_status',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'created_at', 'updated_at']


class BookingCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating bookings"""
    
    class Meta:
        model = Booking
        fields = [
            'service', 'booking_date', 'location', 'property_type',
            'appliance_details', 'issue_description', 'notes'
        ]
    
    def create(self, validated_data):
        """Create booking with price from service"""
        service = validated_data.get('service')
        validated_data['amount'] = service.price
        return super().create(validated_data)
