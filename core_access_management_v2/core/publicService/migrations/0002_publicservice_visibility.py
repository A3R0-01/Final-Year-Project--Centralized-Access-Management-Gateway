# Generated by Django 5.1.5 on 2025-02-17 09:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publicService', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='publicservice',
            name='Visibility',
            field=models.BooleanField(default=True),
        ),
    ]
