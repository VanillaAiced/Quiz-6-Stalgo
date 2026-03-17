"""
Payment Models for PayPal transactions
"""

from django.db import models
from apps.users.models import CustomUser
from apps.bookings.models import Booking


class PayPalTransaction(models.Model):
    """Model for PayPal transaction tracking"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments_made')
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments_received')
    paypal_transaction_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payer_email = models.EmailField()
    receiver_email = models.EmailField()
    order_description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'PayPal Transaction'
        verbose_name_plural = 'PayPal Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['customer', '-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Transaction {self.paypal_transaction_id} - {self.status}"


class Subscription(models.Model):
    """Model for user subscriptions"""
    
    TIER_CHOICES = (
        ('starter', 'Starter'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    )
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='subscription')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='starter')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    paypal_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    subscription_date = models.DateTimeField(auto_now_add=True)
    renewal_date = models.DateTimeField()
    cancelled_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-subscription_date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.tier} ({self.status})"
