"""
Subscription views (uses payment views)
"""

from apps.payments.views import SubscriptionViewSet

# Re-export subscription viewset
__all__ = ['SubscriptionViewSet']
