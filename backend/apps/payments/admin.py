"""
Admin configuration for Payment models
"""

from django.contrib import admin
from .models import PayPalTransaction, Subscription


@admin.register(PayPalTransaction)
class PayPalTransactionAdmin(admin.ModelAdmin):
    """Admin interface for PayPalTransaction model"""
    list_display = ('paypal_transaction_id', 'customer', 'seller', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'currency')
    search_fields = ('paypal_transaction_id', 'customer__email', 'seller__email', 'order_description')
    readonly_fields = ('created_at', 'updated_at', 'paypal_transaction_id')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Admin interface for Subscription model"""
    list_display = ('user', 'tier', 'status', 'price', 'renewal_date', 'subscription_date')
    list_filter = ('tier', 'status', 'subscription_date')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('subscription_date', 'created_at', 'updated_at')
