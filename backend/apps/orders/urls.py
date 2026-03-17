"""URL routes for orders app."""

from django.urls import path

from .views import CreateOrderView, UserOrderHistoryView

app_name = 'orders'

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='create'),
    path('history/', UserOrderHistoryView.as_view(), name='history'),
]
