"""
Admin configuration for User models
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, SellerApplication


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    """Admin interface for CustomUser model"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'created_at')
    list_filter = ('role', 'created_at', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'location', 'gender', 'role', 'merchant_id', 'profile_image', 'bio')}),
    )


@admin.register(SellerApplication)
class SellerApplicationAdmin(admin.ModelAdmin):
    """Admin interface for SellerApplication model"""
    list_display = ('user', 'business_name', 'status', 'applied_at', 'reviewed_at')
    list_filter = ('status', 'applied_at', 'reviewed_at')
    search_fields = ('user__username', 'user__email', 'business_name')
    readonly_fields = ('applied_at', 'reviewed_at', 'reviewed_by')
