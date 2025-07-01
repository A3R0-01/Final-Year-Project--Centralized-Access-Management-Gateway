from core.abstract.serializers import AbstractModelSerializer
from core.siteManager.models import SiteManager
from core.citizen.serializers import StaffCitizenSerializer
from rest_framework.serializers import CharField
from django.contrib.auth.hashers import make_password



class SiteManagerSerializer(AbstractModelSerializer):
    password = CharField(max_length=128, min_length=8, write_only=True, required=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['Citizen'] = StaffCitizenSerializer(instance.Citizen).data
        return data

    def validate_password(self, value: str) -> str:
        return make_password(value)
    class Meta:
        model : SiteManager = SiteManager
        fields = [
            'id', 'ManagerUserName', 'Citizen', 'FirstEmail', 'password', 'SecondEmail', 'Created', 'Updated'
        ]
        read_only_fields = [
            'id', 'Created', 'Updated'
        ]
        write_only_fields = [
            'password'
        ]
