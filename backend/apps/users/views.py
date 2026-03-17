"""
Views for User authentication and management
"""

from django.utils.timezone import now
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import CustomUser, SellerApplication
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    SellerApplicationSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """View for user registration"""
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Create user and return JWT tokens"""
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            user = CustomUser.objects.get(email=response.data['email'])
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': response.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return response


class UserLoginView(generics.GenericAPIView):
    """View for user login with JWT tokens"""
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        if user is None:
            # Try with email as username
            try:
                user_obj = CustomUser.objects.get(email=serializer.validated_data['email'])
                user = authenticate(
                    username=user_obj.username,
                    password=serializer.validated_data['password']
                )
            except CustomUser.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'location': user.location,
                'gender': user.gender,
                'role': user.role,
                'merchant_id': user.merchant_id,
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class TokenRefreshView(generics.GenericAPIView):
    """View to refresh JWT access token"""
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Refresh access token using refresh token"""
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
                'message': 'Token refreshed successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management"""
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SellerApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for seller applications"""
    queryset = SellerApplication.objects.all()
    serializer_class = SellerApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        if user.role == 'admin':
            return SellerApplication.objects.all()
        return SellerApplication.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Create application for current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending seller applications (admin only)"""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_apps = SellerApplication.objects.filter(status='pending')
        serializer = self.get_serializer(pending_apps, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a seller application (admin only)"""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        app = self.get_object()
        merchant_id = request.data.get('merchant_id')
        
        if not merchant_id:
            return Response(
                {'error': 'merchant_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        app.status = 'approved'
        app.reviewed_by = request.user
        app.reviewed_at = now()
        app.user.role = 'seller'
        app.user.merchant_id = merchant_id
        
        app.save()
        app.user.save()
        
        serializer = self.get_serializer(app)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a seller application (admin only)"""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        app = self.get_object()
        reason = request.data.get('reason')
        
        if not reason:
            return Response(
                {'error': 'reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        app.status = 'rejected'
        app.decline_reason = reason
        app.reviewed_by = request.user
        app.reviewed_at = now()
        app.save()
        
        serializer = self.get_serializer(app)
        return Response(serializer.data)


from django.utils.timezone import now
