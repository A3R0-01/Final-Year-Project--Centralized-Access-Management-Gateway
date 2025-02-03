from core.abstract.serializers import AbstractModelSerializer
from rest_framework.serializers import SlugRelatedField
from core.administrator.models import Administrator
from .models import Department

class CitizenDepartmentSerializer(AbstractModelSerializer):
    Administrator = SlugRelatedField(queryset=Administrator.objects.all(), slug_field="PublicId")

    class Meta:
        model : Department = Department
        fields : list[str] = [
            'id', 'Title', 'Email', 'Administrator','Telephone', 'Website','Description', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Title', 'Email', 'Administrator','Telephone', 'Website','Description', 'Created', 'Updated'
        ]

class GranteeDepartmentSerializer(CitizenDepartmentSerializer):

    pass

class AdministratorDepartmentSerializer(GranteeDepartmentSerializer):

    pass

class SiteManagerDepartmentSerializer(AdministratorDepartmentSerializer):


    class Meta:
        model : Department = Department
        fields : list[str] = [
            'id', 'Title', 'Email', 'Administrator', 'Telephone', 'Website', 'Description', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id','Created', 'Updated'
        ]
