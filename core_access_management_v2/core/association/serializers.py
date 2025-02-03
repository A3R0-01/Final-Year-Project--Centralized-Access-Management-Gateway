from rest_framework.serializers import SlugRelatedField
from core.abstract.serializers import AbstractModelSerializer
from core.department.models import Department
from .models import Association

class CitizenAssociationModelSerializer(AbstractModelSerializer):
    Department = SlugRelatedField(queryset=Department.objects.all(), slug_field='PublicId')
    class Meta:
        model : Association = Association
        fields : list[str] = ['id','Title','Email','Department','Description', 'Website','Created', 'Updated']
        read_only_fields : list[str] = [
            'id','Title','Email', 'Department','Website','Description', 'Created', 'Updated'
        ]

class GranteeAssociationModelSerializer(CitizenAssociationModelSerializer):
    pass

class AdministratorAssociationModelSerializer(GranteeAssociationModelSerializer):

    class Meta:
        model : Association = Association
        fields : list[str] = ['id','Title','Email','Department','Website','Description', 'Created', 'Updated']
        read_only_fields : list[str] = [
            'id','Department', 'Created', 'Updated'
        ]

class SiteManagerAssociationModelSerializer(AdministratorAssociationModelSerializer):

    class Meta:
        model : Association = Association
        fields : list[str] = ['id','Title','Email','Department','Website','Description', 'Created', 'Updated']
        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]
