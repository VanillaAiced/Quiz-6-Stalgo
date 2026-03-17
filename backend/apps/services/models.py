"""
Service Models
"""

from django.db import models
from apps.users.models import CustomUser


class Service(models.Model):
    """Model for services offered by sellers"""
    
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=50)  # e.g., "2 hours", "30 mins"
    image_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='service_images/', blank=True, null=True)
    location = models.CharField(max_length=255, default='Pampanga')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_bookings = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} by {self.seller.get_full_name()}"


class ServiceReview(models.Model):
    """Model for service reviews"""
    
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Service Review'
        verbose_name_plural = 'Service Reviews'
        ordering = ['-created_at']
        unique_together = ('service', 'customer')
    
    def __str__(self):
        return f"{self.service.name} - {self.rating} stars by {self.customer.get_full_name()}"
