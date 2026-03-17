"""
Admin configuration for Subscriptions app
"""

from django.contrib import admin

from .models import SubscriptionTier, UserSubscription


@admin.register(SubscriptionTier)
class SubscriptionTierAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'price', 'max_usage')
	search_fields = ('name',)


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'tier', 'usage_left', 'is_active', 'subscribed_at')
	list_filter = ('is_active', 'tier', 'subscribed_at')
	search_fields = ('user__username', 'user__email', 'tier__name')
