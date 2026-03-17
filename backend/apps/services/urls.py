"""
URLs for services
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ServiceReviewViewSet

app_name = 'services'

router = DefaultRouter()
router.register(r'', ServiceViewSet, basename='service')
router.register(r'reviews', ServiceReviewViewSet, basename='service-review')

urlpatterns = [
    path('', include(router.urls)),
]
