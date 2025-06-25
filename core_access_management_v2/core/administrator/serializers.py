from rest_framework.serializers import CharField, SlugRelatedField
from django.contrib.auth.hashers import make_password
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.serializers import StaffCitizenSerializer, Citizen
from .models import Administrator

class AdministratorModelSerializer(AbstractModelSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')
    password = CharField(max_length=128, min_length=8, write_only=True, required=True)

    class Meta:
        model : Administrator = Administrator
        fields : list[str] = [
            'id', 'AdministratorUserName', 'Citizen', 'FirstEmail', 'SecondEmail', 'password', 'GranteeLimit',
            'Created', 'Updated'
        ]

        read_only_fields :list[str] = [
            'id', 'Created', 'Updated', 'GranteeLimit', 'Citizen'
        ]

        write_only_fields : list[str] = [
            'password'
        ]
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizen'] = StaffCitizenSerializer(instance.Citizen).data
        return data
    def validate_password(self, value: str) -> str:
        return make_password(value)

class SiteManagerAdministratorModelSerializer(AdministratorModelSerializer):
    password = CharField(max_length=128, min_length=8, write_only=True, required=True)

    class Meta:
        model : Administrator = Administrator
        fields : list[str] = [
            'id', 'AdministratorUserName', 'Citizen', 'FirstEmail', 'SecondEmail', 'GranteeLimit','password',
            'Created', 'Updated'
        ]
        read_only_fields :list[str] = [
            'id', 'Created', 'Updated'
        ]

        write_only_fields : list[str] = [
            'password'
        ]

    def validate_password(self, value: str) -> str:
        return make_password(value)