from rest_framework import serializers
from core.citizen.serializers import CitizenSerializer, Citizen

class RegisterSerializer(CitizenSerializer):
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)

    class Meta:
        model = Citizen
        fields = [
            'id', 'UserName', 'Email', 'FirstName', 'SecondName', 'Surname', 'DOB', 'NationalId', 'password','is_active',
            'Updated', 'Created',
        ]
        read_only_fields = [
            'id', 'is_active', 'Created', 'Updated'
        ]
    
    def create(self, validated_data):
        return Citizen.objects.create(**validated_data)