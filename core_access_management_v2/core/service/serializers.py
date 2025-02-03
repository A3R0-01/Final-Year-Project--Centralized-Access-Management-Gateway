from rest_framework.serializers import SlugRelatedField
from core.abstract.serializers import AbstractModelSerializer
from core.association.models import Association
from core.grantee.models import Grantee
from .models import Service

class CitizenServiceSerializer(AbstractModelSerializer):
    Association = SlugRelatedField(queryset=Association.objects.all(), slug_field='PublicId')
    Grantee = SlugRelatedField(queryset=Grantee.objects.all(), slug_field='PublicId')

    class Meta:
        model : Service = Service
        fields : list[str] = [
            'id','Title', 'Email', 'Association', 'Description', 'Grantee', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id','Title', 'Email', 'Association', 'Description', 'Grantee', 'Created', 'Updated'
        ]

class GranteeServiceSerializer(CitizenServiceSerializer):
    pass

class AdministratorServiceSerializer(GranteeServiceSerializer):
    class Meta:
        model : Service = Service
        fields : list[str] = [
            'id','Title', 'Email', 'Association', 'Description', 'Grantee', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]
    pass

class SiteManagerServiceSerializer(AdministratorServiceSerializer):
    pass

