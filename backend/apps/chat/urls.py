"""URL routes for chat app."""

from django.urls import path

from .views import AIChatbotView

app_name = 'chat'

urlpatterns = [
    path('ask/', AIChatbotView.as_view(), name='ask'),
]
