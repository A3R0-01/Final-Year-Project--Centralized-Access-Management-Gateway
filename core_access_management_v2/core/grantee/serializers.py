from rest_framework.serializers import CharField, SlugRelatedField
from rest_framework.serializers import raise_errors_on_nested_writes
from rest_framework.utils import model_meta
from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.serializers import StaffCitizenSerializer, Citizen
from core.administrator.models import Administrator
from core.association.models import Association
from core.association.serializers import GranteeAssociationSerializer
from .models import Grantee

class GranteeSerializer(AbstractModelSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field='PublicId')
    Administrator = SlugRelatedField(queryset=Administrator.objects.all(), slug_field='PublicId')
    Association = SlugRelatedField(queryset=Association.objects.all(), slug_field='PublicId')
    password = CharField(max_length=128, min_length=8, write_only=True, required=True)

    def validate_password(self, value: str) -> str:
        return make_password(value)
    
    def update(self, instance : Grantee, validated_data):
        raise_errors_on_nested_writes('update', self, validated_data)
        info = model_meta.get_field_info(instance)

        # Simply set each attribute on the instance, and then save it.
        # Note that unlike `.create()` we don't need to treat many-to-many
        # relationships as being a special case. During updates we already
        # have an instance pk for the relationships to be associated with.
        m2m_fields = []
        for attr, value in validated_data.items():
            if attr in info.relations and info.relations[attr].to_many:
                m2m_fields.append((attr, value))
            else:
                setattr(instance, attr, value)
        if hasattr(instance.Administrator, 'department'):
            if instance.Association.Department == instance.Administrator.department:
                instance.save()

                # Note that many-to-many fields are set after updating instance.
                # Setting m2m fields triggers signals which could potentially change
                # updated instance and we do not want it to collide with .update()
                for attr, value in m2m_fields:
                    field = getattr(instance, attr)
                    field.set(value)

                return instance
        raise ValidationError("administrator and association do not match")

    class Meta:
        model : Grantee = Grantee
        fields : list[str] = [
             'id','GranteeUserName', 'Association', 'Administrator', 'Citizen', 'FirstEmail', 'SecondEmail','password',
            'Created', 'Updated'
        ]
        write_only_fields : list[str] = [
            'password'
        ]
        read_only_fields : list[str] = [
            'id', 'Citizen', 'Association', 'Administrator', 'Created', 'Updated'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizen'] = StaffCitizenSerializer(instance.Citizen).data
        data['Association'] = GranteeAssociationSerializer(instance.Association).data
        return data

class AdministratorGranteeSerializer(GranteeSerializer):
    password = CharField(max_length=128, min_length=8, write_only=True, required=True)
    
    class Meta:
        model : Grantee = Grantee
        fields : list[str] = [
             'id', 'GranteeUserName','Association',  'Administrator', 'Citizen', 'FirstEmail', 'SecondEmail','password',
            'Created', 'Updated'
        ]

        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]

class SiteManagerGranteeSerializer(AdministratorGranteeSerializer):
    class Meta:
        model : Grantee = Grantee
        fields : list[str] = [
             'id', 'GranteeUserName', 'Association', 'Administrator', 'Citizen', 'FirstEmail', 'SecondEmail','password',
            'Created', 'Updated'
        ]

        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]

class PublicServiceGranteeSerializer(AbstractModelSerializer):

    class Meta:
        model: Grantee = Grantee
        fields : list[str] = [
            'id', 'GranteeUserName'
        ]
        read_only_fields : list[str] = [
            'id', 'GranteeUserName'
        ]

class GrantGranteeSerializer(AbstractModelSerializer):

    class Meta:
        model: Grantee = Grantee
        fields : list[str] = [
            'id', 'GranteeUserName'
        ]
        read_only_fields : list[str] = [
            'id', 'GranteeUserName'
        ]