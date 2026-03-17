"""Views for subscription tier and user subscription management."""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import SubscriptionTier, UserSubscription
from .serializers import SubscriptionTierSerializer, UserSubscriptionSerializer


class SubscriptionTierListView(generics.ListAPIView):
	"""Public list of available subscription tiers."""

	serializer_class = SubscriptionTierSerializer
	permission_classes = [AllowAny]
	queryset = SubscriptionTier.objects.all()


class UserSubscriptionView(generics.ListCreateAPIView):
	"""List/create subscriptions for the authenticated user."""

	serializer_class = UserSubscriptionSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return UserSubscription.objects.filter(user=self.request.user).select_related('tier')

	def create(self, request, *args, **kwargs):
		tier_id = request.data.get('tier')
		if not tier_id:
			return Response({'error': 'tier is required'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			tier = SubscriptionTier.objects.get(id=tier_id)
		except SubscriptionTier.DoesNotExist:
			return Response({'error': 'Invalid tier'}, status=status.HTTP_404_NOT_FOUND)

		UserSubscription.objects.filter(user=request.user, is_active=True).update(is_active=False)

		subscription = UserSubscription.objects.create(
			user=request.user,
			tier=tier,
			usage_left=tier.max_usage,
			is_active=True,
		)
		serializer = self.get_serializer(subscription)
		return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyActiveSubscriptionView(generics.RetrieveAPIView):
	"""Return the current active subscription of authenticated user."""

	serializer_class = UserSubscriptionSerializer
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		subscription = UserSubscription.objects.filter(user=request.user, is_active=True).select_related('tier').first()
		if not subscription:
			return Response({'message': 'No active subscription'}, status=status.HTTP_404_NOT_FOUND)
		serializer = self.get_serializer(subscription)
		return Response(serializer.data)
