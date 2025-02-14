from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from core.abstract.serializers import AbstractModelSerializer
from .models import Citizen

class CitizenSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='PublicId', read_only=True, format='hex')
    Created = serializers.DateTimeField(read_only=True)
    Updated = serializers.DateTimeField(read_only=True)

    def validate_password(self, value: str) -> str:
        return make_password(value)
    class Meta:
        model : Citizen = Citizen
        fields = [
            'id', 'UserName', 'Email', 'FirstName', 'SecondName', 'Surname', 'DOB', 'NationalId','is_active',
            'Updated', 'Created',
        ]
        read_only_fields = [
            'id', 'is_active', 'Created', 'Updated'
        ]

class GranteeCitizenModelSerializer(CitizenSerializer):
    class Meta:
        model : Citizen = Citizen
        fields = [
            'id', 'UserName', 'Email', 'FirstName', 'SecondName', 'Surname', 'DOB', 'NationalId','is_active',
            'Updated', 'Created',
        ]
        read_only_fields = [
            'id', 'UserName', 'Email', 'FirstName', 'SecondName', 'Surname', 'DOB', 'NationalId','is_active',
            'Updated', 'Created',
        ]

class AdministratorCitizenModelSerializer(GranteeCitizenModelSerializer):
    pass

class SiteManagerCitizenModelSerializer(AdministratorCitizenModelSerializer):
    pass

class StaffCitizenSerializer(AbstractModelSerializer):

    class Meta:
        model : Citizen = Citizen
        fields : list[str] = [
            'id', 'UserName', 'NationalId', 'Updated', 'Created'
        ]
        read_only_fields : list[str] = [
            'id', 'UserName', 'NationalId', 'Updated', 'Created'
        ]

class RequestCitizenSerializer(AbstractModelSerializer):
    class Meta:
        model : Citizen = Citizen
        fields : list[str] = [
            'id', 'UserName','Email', 'FirstName', 'SecondName',
        ]
        read_only_fields : list[str] = [
            'id', 'UserName','Email', 'FirstName', 'SecondName',
        ]