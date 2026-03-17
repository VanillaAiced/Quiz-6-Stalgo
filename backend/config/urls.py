"""
URL Configuration for the project.
The `urlpatterns` list routes URLs to views.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/auth/', include('apps.users.urls', namespace='auth')),
    path('api/services/', include('apps.services.urls', namespace='services')),
    path('api/bookings/', include('apps.bookings.urls', namespace='bookings')),
    path('api/payments/', include('apps.payments.urls', namespace='payments')),
    path('api/subscriptions/', include('apps.subscriptions.urls', namespace='subscriptions')),
    path('api/applications/', include('apps.applications.urls', namespace='applications')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
