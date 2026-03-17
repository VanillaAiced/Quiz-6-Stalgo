"""
Subscription-related models (extended from payments)
"""

from django.db import models


class SubscriptionTier(models.Model):
	"""Defines chatbot usage plan limits."""

	name = models.CharField(max_length=50, unique=True)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	max_usage = models.PositiveIntegerField()

	class Meta:
		ordering = ['price']

	def __str__(self):
		return f"{self.name} ({self.max_usage} usages)"


class UserSubscription(models.Model):
	"""Subscription record for a user and remaining chatbot usage."""

	user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='user_subscriptions')
	tier = models.ForeignKey(SubscriptionTier, on_delete=models.PROTECT, related_name='subscriptions')
	usage_left = models.PositiveIntegerField()
	is_active = models.BooleanField(default=True)
	subscribed_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-subscribed_at']

	def save(self, *args, **kwargs):
		if self._state.adding and self.usage_left is None:
			self.usage_left = self.tier.max_usage
		super().save(*args, **kwargs)

	def __str__(self):
		return f"{self.user.username} - {self.tier.name} ({self.usage_left} left)"
