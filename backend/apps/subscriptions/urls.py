"""
URLs for subscriptions
"""

from django.urls import path

from .views import SubscriptionTierListView, UserSubscriptionView, MyActiveSubscriptionView

app_name = 'subscriptions'

urlpatterns = [
    path('tiers/', SubscriptionTierListView.as_view(), name='tiers'),
    path('my/', MyActiveSubscriptionView.as_view(), name='my-subscription'),
    path('', UserSubscriptionView.as_view(), name='subscription-list-create'),
]
