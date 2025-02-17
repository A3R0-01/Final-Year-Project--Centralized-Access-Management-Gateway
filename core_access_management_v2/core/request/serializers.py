from rest_framework.serializers import SlugRelatedField
from rest_framework.exceptions import APIException
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.models import Citizen
from core.citizen.serializers import RequestCitizenSerializer
from core.publicService.models import PublicService
from core.publicService.serializers import RequestPublicServiceSerializer
from .models import Request

class CitizenRequestSerializer(AbstractModelSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')
    PublicService = SlugRelatedField(queryset=PublicService.objects.all(), slug_field='PublicId')

    def to_representation(self, instance:Request):
        data = super().to_representation(instance)
        try:
            data['Citizen'] = RequestCitizenSerializer(instance.Citizen).data
            data['PublicService'] = RequestPublicServiceSerializer(instance.PublicService).data
            if hasattr(instance, 'grant'):
                data['Granted'] = instance.grant.granted
                return data
            else:
                raise Exception()
        except:
            raise APIException('Failed to produce data')

    class Meta:
        model : Request = Request
        fields : list[str] = [
            'id', 'Subject', 'Message', 'Citizen', 'PublicService', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Grant', 'Created', 'Updated'
        ]

class GranteeRequestSerializer(CitizenRequestSerializer):
    class Meta:
        model : Request = Request
        fields : list[str] = [
            'id', 'Subject', 'Message', 'Citizen', 'PublicService', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Subject', 'Message', 'Citizen', 'PublicService', 'Created', 'Updated'
        ]

class AdministratorRequestSerializer(GranteeRequestSerializer):
    pass

class SiteManagerRequestSerializer(AdministratorRequestSerializer):

    pass

class GrantRequestSerializer(CitizenRequestSerializer):

    class Meta:
        model : Request = Request
        fields : list[str] = [
            'id', 'Subject', 'Citizen', 'PublicService'
        ]
        read_only_fields : list[str] = [
            'id', 'Subject', 'Citizen', 'PublicService'
        ]
