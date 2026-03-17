"""
Admin configuration for Booking models
"""

from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin interface for Booking model"""
    list_display = ('id', 'customer', 'service', 'booking_date', 'status', 'payment_status', 'amount', 'created_at')
    list_filter = ('status', 'payment_status', 'booking_date', 'created_at', 'service')
    search_fields = ('customer__username', 'customer__email', 'service__name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Booking Info', {'fields': ('customer', 'service', 'booking_date', 'amount')}),
        ('Details', {'fields': ('location', 'property_type', 'appliance_details', 'issue_description', 'notes')}),
        ('Status', {'fields': ('status', 'payment_status')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
