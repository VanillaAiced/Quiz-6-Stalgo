"""
Admin configuration for Service models
"""

from django.contrib import admin
from .models import Service, ServiceReview


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin interface for Service model"""
    list_display = ('service_name', 'seller', 'price', 'duration_of_service', 'created_at')
    list_filter = ('created_at', 'seller')
    search_fields = ('service_name', 'description', 'seller__first_name', 'seller__last_name')
    readonly_fields = ('created_at',)


@admin.register(ServiceReview)
class ServiceReviewAdmin(admin.ModelAdmin):
    """Admin interface for ServiceReview model"""
    list_display = ('service', 'customer', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('service__service_name', 'customer__username', 'customer__email')
    readonly_fields = ('created_at',)
