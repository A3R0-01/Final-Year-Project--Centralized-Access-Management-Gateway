from rest_framework.serializers import SlugRelatedField, SerializerMethodField
from core.abstract.serializers import AbstractPermissionSerializer
from core.publicService.models import PublicService
from core.publicService.serializers import PermissionPublicServiceSerializer
from core.association.models import Association
from core.association.serializers import PermissionAssociationSerializer
from core.department.models import Department
from core.department.serializers import PermissionDepartmentSerializer
from .models import PublicServicePermission, AssociationPermission, DepartmentPermission

class PublicServicePermissionSerializer(AbstractPermissionSerializer):
    PublicService = SlugRelatedField(queryset=PublicService.objects.all())

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['PublicService'] = PermissionPublicServiceSerializer(instance.PublicService).data
        return data
    
    class Meta:
        model : PublicServicePermission = PublicServicePermission
        fields : list[str] = [
            'id','Name', 'PermissionOpen', 'PublicService', 'Description' ,'StartTime', 'EndTime', 'Citizens', 'Created', 'Updated'
        ]
class AssociationPermissionSerializer(AbstractPermissionSerializer):
    Association = SlugRelatedField(queryset=Association.objects.all(), slug_field='PublicId')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Association'] = PermissionAssociationSerializer(instance.Association).data
        return data
    
    class Meta:
        model : AssociationPermission = AssociationPermission
        fields : list[str] = [
            'id','Name', 'PermissionOpen', 'Association', 'Description' ,'StartTime', 'EndTime', 'Citizens', 'Created', 'Updated'
        ]

class DepartmentPermissionSerializer(AbstractPermissionSerializer):
    Department = SlugRelatedField(queryset=Department.objects.all(), slug_field='PublicId')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Department'] = PermissionDepartmentSerializer(instance.Department).data
        return data

    class Meta:
        model : DepartmentPermission = DepartmentPermission
        fields : list[str] = [
            'id','Name', 'PermissionOpen', 'Department', 'Description' ,'StartTime', 'EndTime', 'Citizens', 'Created', 'Updated'
        ]
