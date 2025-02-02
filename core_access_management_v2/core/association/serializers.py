from rest_framework.serializers import SlugRelatedField
from core.abstract.serializers import AbstractModelSerializer
from .models import Association

class GranteeAssociationModelSerializer(AbstractModelSerializer):

    class Meta:
        model : Association = Association
        fields : list[str] = [
            'id', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id','Title','Email', 'Created', 'Updated'
        ]

class AdministratorAssociationModelSerializer(AbstractModelSerializer):

    class Meta:
        model : Association = Association
        fields : list[str] = [
            'id', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]

class SiteManagerAssociationModelSerializer(AbstractModelSerializer):

    class Meta:
        model : Association = Association
        fields : list[str] = [
            'id', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]
