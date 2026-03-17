"""Serializers for subscriptions app."""

from rest_framework import serializers

from .models import SubscriptionTier, UserSubscription


class SubscriptionTierSerializer(serializers.ModelSerializer):
	"""Serializer for subscription tier configuration."""

	class Meta:
		model = SubscriptionTier
		fields = ['id', 'name', 'price', 'max_usage']


class UserSubscriptionSerializer(serializers.ModelSerializer):
	"""Serializer for user subscription records."""

	tier_data = SubscriptionTierSerializer(source='tier', read_only=True)

	class Meta:
		model = UserSubscription
		fields = ['id', 'user', 'tier', 'tier_data', 'usage_left', 'is_active', 'subscribed_at']
		read_only_fields = ['id', 'user', 'usage_left', 'subscribed_at']
