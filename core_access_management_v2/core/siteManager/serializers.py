from core.abstract.serializers import AbstractModelSerializer
from core.siteManager.models import SiteManager
from core.citizen.serializers import StaffCitizenSerializer

class SiteManagerSerializer(AbstractModelSerializer):

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizen'] = StaffCitizenSerializer(instance.Citizen).data
        return data

    class Meta:
        model : SiteManager = SiteManager
        fields = [
            'id', 'ManagerUserName', 'Citizen', 'FirstEmail', 'SecondEmail', 'Created', 'Updated'
        ]
        read_only_fields = [
            'id', 'Created', 'Updated'
        ]
