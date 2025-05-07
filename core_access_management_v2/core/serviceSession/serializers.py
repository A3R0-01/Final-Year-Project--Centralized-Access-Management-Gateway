from rest_framework import serializers
from core.abstract.serializers import AbstractModelSerializer
from core.citizen.models import Citizen as CitizenModel
from core.publicService.models import PublicService
from .models import ServiceSession

class ManagerServiceSessionSerializer(AbstractModelSerializer):
    Citizen = serializers.SlugRelatedField(queryset=CitizenModel.objects.all(), slug_field="PublicId")
    Service = serializers.SlugRelatedField(queryset=PublicService.objects.all(), slug_field="PublicId")

    class Meta:
        model : ServiceSession = ServiceSession
        fields : list[str] = [
            'id', 'Citizen', 'Service', 'Created', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'Created'
        ]