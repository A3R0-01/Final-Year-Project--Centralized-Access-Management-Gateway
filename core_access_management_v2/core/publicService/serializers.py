from rest_framework.serializers import SlugRelatedField, raise_errors_on_nested_writes
from rest_framework.exceptions import ValidationError
from rest_framework.utils import model_meta
from core.abstract.serializers import AbstractModelSerializer
from core.association.models import Association
from core.association.serializers import PublicServiceAssociationSerializer
from core.grantee.models import Grantee
from core.grantee.serializers import PublicServiceGranteeSerializer
from .models import PublicService
from pprint import pprint

class CitizenPublicServiceSerializer(AbstractModelSerializer):
    Association = SlugRelatedField(queryset=Association.objects.all(), slug_field='PublicId')
    Grantee = SlugRelatedField(queryset=Grantee.objects.all(), slug_field='PublicId', many=True)
    
    def to_representation(self, instance:PublicService):
        data = super().to_representation(instance)
        data['Grantee'] = [ PublicServiceGranteeSerializer(grantee).data for grantee in instance.Grantee.all()]
        data['Association'] = PublicServiceAssociationSerializer(instance.Association).data
        pprint(data)
        return data

    def update(self, instance : PublicService, validated_data):
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
        granteeError = []
        for grantee in instance.Grantee.all():
            if grantee.Association != instance.Association:
                granteeError.append(grantee)
        if len(granteeError) <= 0:

            instance.save()

            # Note that many-to-many fields are set after updating instance.
            # Setting m2m fields triggers signals which could potentially change
            # updated instance and we do not want it to collide with .update()
            for attr, value in m2m_fields:
                field = getattr(instance, attr)
                field.set(value)

            return instance
        raise ValidationError("Grantee does not belong to the association: %s", granteeError)

    def create(self, validated_data):
        return self.Meta.model.objects.create(**validated_data)
    class Meta:
        model : PublicService = PublicService
        fields : list[str] = [
            'id','Title', 'Email', 'Association', 'Description', 'URL', 'Grantee', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id','Title', 'Email', 'Association', 'Description', 'URL', 'Grantee', 'Created', 'Updated'
        ]

class GranteePublicServiceSerializer(CitizenPublicServiceSerializer):
    pass

class AdministratorPublicServiceSerializer(GranteePublicServiceSerializer):
    class Meta:
        model : PublicService = PublicService
        fields : list[str] = [
            'id','Title', 'Email', 'Association', 'Description', 'URL', 'Grantee', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Created', 'Updated'
        ]
    pass

class SiteManagerPublicServiceSerializer(AdministratorPublicServiceSerializer):
    pass

class RequestPublicServiceSerializer(AbstractModelSerializer):

    class Meta:
        model : PublicService = PublicService
        fields : list[str] = [
            'id','Title', 'URL'
        ]
        read_only_fields : list[str] =  [
            'id','Title', 'URL'
        ]
