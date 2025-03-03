from rest_framework.serializers import SlugRelatedField, SerializerMethodField
from types import NoneType
from core.abstract.serializers import AbstractModelSerializer
from core.request.models import Request
from core.request.serializers import GrantRequestSerializer
from core.grantee.models import Grantee
from core.grantee.serializers import GrantGranteeSerializer
from .models import Grant

class CitizenGrantSerializer(AbstractModelSerializer):
    Request = SlugRelatedField(queryset=Request.objects.all(), slug_field="PublicId")
    Granted = SerializerMethodField()

    def get_Granted(self, grant:Grant):
        return Grant.granted

    def to_representation(self, instance : Grant):
        data = super().to_representation(instance)
        data['Request'] = GrantRequestSerializer(instance.Request).data
    class Meta:
        model : Grant = Grant
        fields : list[str] = [
            'id', 'Request', 'Decline', 'Granted', 'StartDate', 'EndDate', 'Message', 'Created', 'Updated'
        ]
        read_only_field : list[str] = [
            'id', 'Request', 'Decline', 'Granted', 'StartDate', 'EndDate', 'Message', 'Created', 'Updated'

        ]
    
class GranteeGrantSerializer(CitizenGrantSerializer):
    Grantee = SlugRelatedField(queryset=Grantee.objects.all(), slug_field="PublicId", null=true)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        print(data)
        answer = bool(instance.Grantee)
        print(instance)
        if bool(instance.Grantee):
            data['Grantee'] = GrantGranteeSerializer(instance.Grantee).data
        print(data)
        return data

    class Meta:
        model : Grant = Grant
        fields : list[str] = [
            'id', 'Request', 'Grantee', 'Decline', 'Granted', 'StartDate', 'EndDate', 'Message', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Request', 'Created', 'Updated'
        ]

class AdministratorGrantSerializer(GranteeGrantSerializer):

    class Meta:
        model : Grant = Grant
        fields : list[str] = [
            'id', 'Request', 'Grantee', 'Decline', 'Granted', 'StartDate', 'EndDate', 'Message', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Request', 'Grantee', 'Decline', 'Granted', 'StartDate', 'EndDate', 'Message', 'Created', 'Updated'
        ]

class SiteManagerGrantSerializer(GranteeGrantSerializer):

    class Meta:
        model : Grant = Grant
        fields : list[str] = [
            'id', 'Request', 'Grantee', 'Decline', 'Granted', 'StartDate', 'EndDate', 'Message', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Request', 'Grantee', 'Decline', 'Granted', 'StartDate', 'EndDate', 'Message', 'Created', 'Updated'
        ]
