"""
Views for Service management
"""

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied

from .models import Service
from .serializers import ServiceSerializer


class ServiceListView(generics.ListAPIView):
    """Public list of services."""

    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Service.objects.select_related('seller').all()


class ServiceDetailView(generics.RetrieveAPIView):
    """Public detail view for a single service."""

    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    queryset = Service.objects.select_related('seller').all()


class SellerServiceManageView(generics.ListCreateAPIView):
    """Seller-only list/create endpoint for owned services."""

    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.role != 'seller':
            raise PermissionDenied('Only sellers can manage services.')
        return Service.objects.filter(seller=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'seller':
            raise PermissionDenied('Only sellers can create services.')
        serializer.save(seller=self.request.user)


class SellerServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Seller-only detail endpoint for retrieve/update/delete of owned service."""

    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.user.role != 'seller':
            raise PermissionDenied('Only sellers can manage services.')
        return Service.objects.filter(seller=self.request.user)
