from rest_framework.serializers import CharField, SlugRelatedField
from django.contrib.auth.hashers import make_password
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.serializers import StaffCitizenSerializer, Citizen
from core.administrator.models import Administrator
from .models import Grantee

class GranteeSerializer(AbstractModelSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')
    Administrator = SlugRelatedField(queryset=Administrator.objects.all(), slug_field='PublicId')
    password = CharField(max_length=128, min_length=8, write_only=True, required=True)

    def validate_password(self, value: str) -> str:
        return make_password(value)
    class Meta:
        model : Grantee = Grantee
        fields : list[str] = [
             'id','GranteeUserName', 'Administrator', 'Citizen', 'FirstEmail', 'SecondEmail','password',
            'Created', 'Updated'
        ]
        write_only_fields : list[str] = [
            'password'
        ]
        read_only_fields : list[str] = [
            'id', 'Citizen', 'Created', 'Updated'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizen'] = StaffCitizenSerializer(instance.Citizen).data
        return data

class AdministratorGranteeSerializer(GranteeSerializer):
    password = CharField(max_length=128, min_length=8, write_only=True, required=True)
    
    class Meta:
        model : Grantee = Grantee
        fields : list[str] = [
             'id', 'GranteeUserName', 'Administrator', 'Citizen', 'FirstEmail', 'SecondEmail','password',
            'Created', 'Updated'
        ]

        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]