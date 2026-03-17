"""
Subscription serializers (currently uses payment serializers)
"""

from rest_framework import serializers
from apps.payments.models import Subscription as SubscriptionModel
from apps.payments.serializers import SubscriptionSerializer

# Re-export subscription serializer
__all__ = ['SubscriptionSerializer']
