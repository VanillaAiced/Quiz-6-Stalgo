"""
URLs for payments
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayPalTransactionViewSet, SubscriptionViewSet

app_name = 'payments'

router = DefaultRouter()
router.register(r'transactions', PayPalTransactionViewSet, basename='paypal-transaction')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('', include(router.urls)),
]
