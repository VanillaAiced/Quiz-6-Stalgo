"""
URLs for user authentication and management
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MyTokenObtainPairView,
    RegisterView,
    UserProfileView,
    AdminUserListView,
    UserViewSet,
    SellerApplicationViewSet
)

app_name = 'auth'

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'seller-applications', SellerApplicationViewSet, basename='seller-application')

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('', include(router.urls)),
]
