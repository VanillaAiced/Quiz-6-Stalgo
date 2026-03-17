"""
User Models for authentication and user management
"""

from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """Extended user model with additional fields"""
    
    ROLE_CHOICES = (
        ('user', 'Regular User'),
        ('seller', 'Service Provider'),
        ('admin', 'Administrator'),
    )
    
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    merchant_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


class SellerApplication(models.Model):
    """Model for seller application management"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='seller_application')
    business_name = models.CharField(max_length=255)
    business_description = models.TextField()
    business_experience = models.TextField()
    business_license = models.FileField(upload_to='licenses/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    decline_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Seller Application'
        verbose_name_plural = 'Seller Applications'
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.status}"
