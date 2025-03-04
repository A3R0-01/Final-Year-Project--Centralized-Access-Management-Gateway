from rest_framework.serializers import SlugRelatedField
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.models import Citizen
from core.citizen.serializers import StaffCitizenSerializer
from .models import AbstractLogModel

class AbstractLogSerializer(AbstractModelSerializer):
    Citizen = SlugRelatedField(queryset=Citizen.objects.all(), slug_field="PublicId")

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
