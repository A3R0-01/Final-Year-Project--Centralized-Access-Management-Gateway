# Generated by Django 5.1.5 on 2025-05-12 13:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='abstractlogmodel',
            name='IpAddress',
            field=models.CharField(default='Unknown', max_length=19),
            preserve_default=False,
        ),
    ]
