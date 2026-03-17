from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'service', 'price_paid', 'date_purchased')
    search_fields = ('buyer__username', 'paypal_transaction_id', 'service__service_name')
    list_filter = ('date_purchased',)
