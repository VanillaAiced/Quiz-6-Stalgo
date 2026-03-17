"""
URLs for user authentication and management
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView,
    UserLoginView,
    TokenRefreshView,
    UserViewSet,
    SellerApplicationViewSet
)

app_name = 'auth'

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'seller-applications', SellerApplicationViewSet, basename='seller-application')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('token-refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('', include(router.urls)),
]
