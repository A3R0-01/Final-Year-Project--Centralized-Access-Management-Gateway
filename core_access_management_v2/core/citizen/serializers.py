from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Citizen

class CitizenSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='PublicId', read_only=True, format='hex')
    Created = serializers.DateTimeField(read_only=True)
    Updated = serializers.DateTimeField(read_only=True)

    def validate_password(self, value: str) -> str:
        return make_password(value)
    class Meta:
        model = Citizen
        fields = [
            'id', 'UserName', 'Email', 'FirstName', 'SecondName', 'Surname', 'DOB', 'NationalId','is_active',
            'Updated', 'Created',
        ]
        read_only_fields = [
            'id', 'is_active', 'Created', 'Updated'
        ]