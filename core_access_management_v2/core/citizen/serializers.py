from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from core.abstract.serializers import AbstractModelSerializer
from .models import Citizen

class CitizenSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='PublicId', read_only=True, format='hex')
    password = serializers.CharField(max_length=128, min_length=8, write_only=True, required=True)
    Created = serializers.DateTimeField(read_only=True)
    Updated = serializers.DateTimeField(read_only=True)

    def validate_password(self, value: str) -> str:
        return make_password(value)
    class Meta:
        model : Citizen = Citizen
        fields = [
            'id', 'UserName', 'Email', 'FirstName', 'SecondName', 'Surname', 'DOB', 'NationalId', 'password','is_active',
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
            'id', 'UserName', 'NationalId'
        ]
        read_only_fields : list[str] = [
            'id', 'UserName', 'NationalId'
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
class PermissionCitizenSerializer(AbstractModelSerializer):
    class Meta:
        model : Citizen = Citizen
        fields : list[str] = [
            'id', 'UserName','Email', 'FirstName', 'SecondName',
        ]
        read_only_fields : list[str] = [
            'id', 'UserName','Email', 'FirstName', 'SecondName',
        ]