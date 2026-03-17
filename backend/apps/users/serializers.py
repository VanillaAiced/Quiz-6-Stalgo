"""
Serializers for User models
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, SellerApplication


class UserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser model"""
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'location', 'gender', 'role', 'merchant_id',
            'profile_image', 'bio', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'merchant_id']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'location', 'gender'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user info"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        
        return token
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class SellerApplicationSerializer(serializers.ModelSerializer):
    """Serializer for SellerApplication model"""
    
    user_data = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = SellerApplication
        fields = [
            'id', 'user', 'user_data', 'business_name', 'business_description',
            'business_experience', 'business_license', 'status', 'applied_at',
            'reviewed_at', 'decline_reason'
        ]
        read_only_fields = ['id', 'applied_at', 'reviewed_at', 'decline_reason']
