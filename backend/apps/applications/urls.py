"""URLs for applications app."""

from django.urls import path

from .views import (
    ApproveApplicationView,
    DeclineApplicationView,
    SubmitApplicationView,
    ListApplicationView,
)

app_name = 'applications'

urlpatterns = [
    path('apply/', SubmitApplicationView.as_view(), name='apply'),
    path('list/', ListApplicationView.as_view(), name='list'),
    path('<int:pk>/approve/', ApproveApplicationView.as_view(), name='approve'),
    path('<int:pk>/decline/', DeclineApplicationView.as_view(), name='decline'),
]
