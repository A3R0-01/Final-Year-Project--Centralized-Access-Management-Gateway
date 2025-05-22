from rest_framework import serializers
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.models import Citizen as CitizenModel
from core.publicService.models import PublicService
from core.citizen.serializers import ServiceSessionCitizenSerializer
from core.publicService.serializers import ServiceSessionPublicServiceSerializer
from .models import ServiceSession

class GranteeServiceSessionSerializer(AbstractModelSerializer):

    Citizen = serializers.SlugRelatedField(queryset=CitizenModel.objects.all(), slug_field="PublicId")
    Service = serializers.SlugRelatedField(queryset=PublicService.objects.all(), slug_field="PublicId")
    Expired = serializers.SerializerMethodField()

    def get_Expired(self, serviceSession : ServiceSession) -> bool:
        return serviceSession.expired

    def to_representation(self, instance) -> dict:
        data = super().to_representation(instance)
        data['Citizen'] = ServiceSessionCitizenSerializer(instance.Citizen).data
        data['Service'] = ServiceSessionPublicServiceSerializer(instance.Service).data
        return data
    class Meta:
        model : ServiceSession = ServiceSession
        fields : list[str] = [
            'id', 'Citizen', 'Service', "IpAddress", 'EnforceExpiry', 'LastSeen', 'Expired', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Citizen', 'Service', "IpAddress", 'EnforceExpiry', 'LastSeen', 'Expired', 'Created', 'Updated'
        ]

class AdministratorServiceSessionSerializer(GranteeServiceSessionSerializer):

    class Meta:
        model : ServiceSession = ServiceSession
        fields : list[str] = [
            'id', 'Citizen', 'Service', "IpAddress", 'EnforceExpiry', 'LastSeen', 'Expired', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Citizen', 'Service', "IpAddress", 'EnforceExpiry', 'LastSeen', 'Expired', 'Created', 'Updated'
        ]

class SiteManagerServiceSessionSerializer(GranteeServiceSessionSerializer):

    class Meta:
        model : ServiceSession = ServiceSession
        fields : list[str] = [
            'id', 'Citizen', 'Service', "IpAddress", 'EnforceExpiry', 'LastSeen', 'Expired', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Created', 'Expired', 'Updated'
        ]