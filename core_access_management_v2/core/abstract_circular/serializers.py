from rest_framework import serializers
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.models import Citizen
from core.citizen.serializers import PermissionCitizenSerializer
from core.citizen.serializers import StaffCitizenSerializer
from .models import AbstractLogModel
from .models import AbstractPermission

class AbstractPermissionSerializer(AbstractModelSerializer):
    Citizens = serializers.SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId', many=True)
    PermissionOpen = serializers.SerializerMethodField()

    def get_PermissionOpen(self, permission : AbstractPermission):
        return permission.permission_open

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizens'] = PermissionCitizenSerializer(instance.Citizens).data
        return data

    class Meta:
        model : AbstractPermission = AbstractPermission


class AbstractLogSerializer(AbstractModelSerializer):
    Citizen = serializers.SlugRelatedField(queryset=Citizen.objects.all(), slug_field="PublicId")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizen'] = StaffCitizenSerializer(instance.Citizen).data
        return data

    class Meta:
        model : AbstractLogModel = AbstractLogModel
        fields : list[str] = [
            'id','Citizen', 'Method', 'Object', 'RecordId', 'Message', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id','Citizen', 'Method', 'Object', 'RecordId', 'Message', 'Created', 'Updated'
        ]
