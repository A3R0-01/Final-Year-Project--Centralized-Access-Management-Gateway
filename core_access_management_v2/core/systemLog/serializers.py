from rest_framework.serializers import SlugRelatedField
from core.siteManager.models import SiteManager
from core.administrator.models import Administrator
from core.citizen.models import Citizen
from core.grantee.models import Grantee
from core.abstract_circular.serializers import AbstractLogSerializer
from .models import CitizenLog, GranteeLog, AdministratorLog, SiteManagerLog


class SiteManagerLogSerializer(AbstractLogSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')
    
    class Meta:
        model : SiteManagerLog = SiteManagerLog
        fields : list[str] = [
            'id','Citizen', 'IpAddress', 'SiteManager', 'Method', 'Object', 'RecordId', 'Message', 'Created', 'Updated'

        ]

class AdministratorLogSerializer(AbstractLogSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')

    class Meta:
        model : AdministratorLog = AdministratorLog
        fields : list[str] = [
            'id','Citizen', 'IpAddress', 'Administrator', 'Method', 'Object', 'RecordId', 'Message', 'Created', 'Updated'

        ]

class GranteeLogSerializer(AbstractLogSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')

    class Meta:
        model : GranteeLog = GranteeLog
        fields : list[str] = [
            'id','Citizen', 'IpAddress', 'Grantee', 'Method', 'Object', 'RecordId', 'Message', 'Created', 'Updated'

        ]

class CitizenLogSerializer(AbstractLogSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')

    class Meta:
        model : CitizenLog = CitizenLog
        fields : list[str] = [
            'id','Citizen', 'IpAddress', 'Method', 'Object', 'RecordId', 'Message', 'Created', 'Updated'

        ]