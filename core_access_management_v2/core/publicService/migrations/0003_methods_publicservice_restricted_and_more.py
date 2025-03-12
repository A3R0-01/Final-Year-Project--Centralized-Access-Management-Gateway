# Generated by Django 5.1.5 on 2025-03-12 14:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publicService', '0002_publicservice_visibility'),
    ]

    operations = [
        migrations.CreateModel(
            name='Methods',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('GET', 'GET'), ('POST', 'POST'), ('PATCH', 'PATCH')], unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='publicservice',
            name='Restricted',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='publicservice',
            name='Email',
            field=models.EmailField(max_length=254, unique=True),
        ),
        migrations.AddField(
            model_name='publicservice',
            name='Methods',
            field=models.ManyToManyField(null=True, to='publicService.methods'),
        ),
    ]
