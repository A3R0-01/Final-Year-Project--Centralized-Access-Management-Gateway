# Generated by Django 5.1.5 on 2025-02-03 12:08

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('administrator', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('PublicId', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ('Created', models.DateTimeField(auto_now_add=True)),
                ('Updated', models.DateTimeField(auto_now=True)),
                ('Title', models.CharField(max_length=100, unique=True)),
                ('Description', models.TextField()),
                ('Email', models.EmailField(max_length=254, unique=True)),
                ('Telephone', models.CharField(unique=True)),
                ('Website', models.URLField(unique=True)),
                ('Administrator', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='administrator.administrator')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
