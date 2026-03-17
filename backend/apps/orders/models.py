"""Order models for successful PayPal purchases."""

from django.db import models


class Order(models.Model):
    """Stores successful purchase records tied to a service."""

    buyer = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='orders')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='orders')
    paypal_transaction_id = models.CharField(max_length=255, unique=True)
    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    date_purchased = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_purchased']

    def __str__(self):
        return f"Order #{self.id} - {self.buyer.username} - {self.service.service_name}"
