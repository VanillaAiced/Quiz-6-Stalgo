"""
URLs for services
"""

from django.urls import path
from .views import (
    ServiceListView,
    ServiceDetailView,
    SellerServiceManageView,
    SellerServiceDetailView,
)

app_name = 'services'

urlpatterns = [
    path('list/', ServiceListView.as_view(), name='list'),
    path('<int:pk>/', ServiceDetailView.as_view(), name='detail'),
    path('manage/', SellerServiceManageView.as_view(), name='manage'),
    path('manage/<int:pk>/', SellerServiceDetailView.as_view(), name='manage-detail'),
]
