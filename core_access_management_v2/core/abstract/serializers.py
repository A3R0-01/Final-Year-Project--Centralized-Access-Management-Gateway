from rest_framework import serializers
from core.citizen.models import Citizen
from core.citizen.serializers import PermissionCitizenSerializer
from .models import AbstractModel, AbstractPermission

class AbstractModelSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex', source='PublicId', read_only=True)
    Created = serializers.DateTimeField(read_only=True)
    Updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model:AbstractModel = AbstractModel
        read_only_fields = ['id', 'created', 'updated']
class AbstractPermissionSerializer(AbstractModelSerializer):
    Citizens = serializers.SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')
    PermissionOpen = serializers.SerializerMethodField()

    def get_PermissionOpen(self, permission : AbstractPermission):
        return permission.permission_open

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizens'] = PermissionCitizenSerializer(instance.Citizens).data
        return data

    class Meta:
        model : AbstractPermission = AbstractPermission