"""
Views for Service management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Service, ServiceReview
from .serializers import ServiceSerializer, ServiceReviewSerializer, ServiceCreateUpdateSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for service management"""
    queryset = Service.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'seller', 'is_active']
    search_fields = ['name', 'description', 'seller__first_name', 'seller__last_name']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializer for create/update"""
        if self.action in ['create', 'update', 'partial_update']:
            return ServiceCreateUpdateSerializer
        return ServiceSerializer
    
    def perform_create(self, serializer):
        """Create service for current seller"""
        serializer.save(seller=self.request.user)
    
    def get_queryset(self):
        """Get queryset based on user role"""
        queryset = Service.objects.all()
        
        # Filter by seller if querying user's services
        if self.request.query_params.get('my_services') == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(seller=self.request.user)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_services(self, request):
        """Get current user's services (seller only)"""
        if request.user.role != 'seller':
            return Response(
                {'error': 'Only sellers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        services = Service.objects.filter(seller=request.user)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get reviews for a service"""
        service = self.get_object()
        reviews = service.reviews.all()
        serializer = ServiceReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class ServiceReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for service reviews"""
    queryset = ServiceReview.objects.all()
    serializer_class = ServiceReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['service', 'customer', 'rating']
    
    def perform_create(self, serializer):
        """Create review for current user"""
        serializer.save(customer=self.request.user)
    
    def get_queryset(self):
        """Filter reviews based on user role"""
        user = self.request.user
        if user.role == 'admin':
            return ServiceReview.objects.all()
        elif user.role == 'seller':
            return ServiceReview.objects.filter(service__seller=user)
        else:
            return ServiceReview.objects.filter(customer=user)
