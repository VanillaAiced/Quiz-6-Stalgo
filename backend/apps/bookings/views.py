"""
Views for Booking management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Booking
from .serializers import BookingSerializer, BookingCreateUpdateSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for booking management"""
    queryset = Booking.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'service', 'customer']
    search_fields = ['service__name', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['booking_date', 'created_at', 'amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializer for create/update"""
        if self.action in ['create', 'update', 'partial_update']:
            return BookingCreateUpdateSerializer
        return BookingSerializer
    
    def perform_create(self, serializer):
        """Create booking for current customer"""
        serializer.save(customer=self.request.user)
    
    def get_queryset(self):
        """Filter bookings based on user role"""
        user = self.request.user
        queryset = Booking.objects.all()
        
        if user.role == 'customer' or user.role == 'user':
            # Users see only their own bookings
            queryset = queryset.filter(customer=user)
        elif user.role == 'seller':
            # Sellers see bookings for their services
            queryset = queryset.filter(service__seller=user)
        # Admins see all bookings
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get current user's bookings"""
        if request.user.role not in ['user', 'customer']:
            return Response(
                {'error': 'Only customers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookings = Booking.objects.filter(customer=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def seller_bookings(self, request):
        """Get bookings for seller's services"""
        if request.user.role != 'seller':
            return Response(
                {'error': 'Only sellers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookings = Booking.objects.filter(service__seller=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a booking (seller only)"""
        booking = self.get_object()
        
        if request.user.role != 'seller' or booking.service.seller != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = 'confirmed'
        booking.save()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        if request.user not in [booking.customer, booking.service.seller]:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status == 'completed':
            return Response(
                {'error': 'Cannot cancel completed booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)
