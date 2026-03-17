from django.db import migrations


def seed_default_tiers(apps, schema_editor):
    SubscriptionTier = apps.get_model('subscriptions', 'SubscriptionTier')

    tiers = [
        ('1st tier', '199.00', 3),
        ('2nd tier', '299.00', 5),
        ('3rd tier', '499.00', 10),
    ]

    for name, price, max_usage in tiers:
        SubscriptionTier.objects.update_or_create(
            name=name,
            defaults={'price': price, 'max_usage': max_usage},
        )


def unseed_default_tiers(apps, schema_editor):
    SubscriptionTier = apps.get_model('subscriptions', 'SubscriptionTier')
    SubscriptionTier.objects.filter(name__in=['1st tier', '2nd tier', '3rd tier']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_default_tiers, unseed_default_tiers),
    ]
