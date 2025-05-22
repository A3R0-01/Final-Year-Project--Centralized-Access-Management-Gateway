from core.systemCron.models import SystemCron, systemLog
from rest_framework.status import HTTP_201_CREATED
from core.systemLog.serializers import CitizenLogSerializer, SiteManagerLogSerializer, AdministratorLogSerializer, GranteeLogSerializer
from core.abstract_circular.serializers import AbstractLogSerializer
from core.abstract.kafka import NewKafkaConsumer
from core.abstract_circular.viewsets import AdministratorLogViewSet, SiteManagerLogViewSet, GranteeLogViewSet
from .serializers import CitizenLogSerializer, GranteeLogSerializer, AdministratorLogSerializer, SiteManagerLogSerializer
from pprint import pprint
from django.utils import timezone
from threading import Thread
from django.conf import settings
from rest_framework.response import Response
import logging
import json

logger = logging.getLogger(__name__)

# Create your views here.
class GranteeCitizenLogViewSet(GranteeLogViewSet):
    serializer_class = CitizenLogSerializer

class AdministratorCitizenLogViewSet(AdministratorLogViewSet):
    serializer_class = CitizenLogSerializer

class AdministratorGranteeLogViewSet(AdministratorLogViewSet):
    serializer_class = GranteeLogSerializer

class SiteManagerCitizenLogViewSet(SiteManagerLogViewSet):
    serializer_class = CitizenLogSerializer

class SiteManagerGranteeLogViewSet(SiteManagerLogViewSet):
    serializer_class = GranteeLogSerializer

class SiteManagerAdministratorLogViewSet(SiteManagerLogViewSet):
    serializer_class = AdministratorLogSerializer

class SiteManagerManagerLogViewSet(SiteManagerLogViewSet):
    http_method_names = ('post', 'get')
    serializer_class = SiteManagerLogSerializer

    def createLog(self, data:dict, serializer_class: AbstractLogSerializer):
        try:
            serializer : AbstractLogSerializer = serializer_class(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return serializer.data
        except Exception as e:
            return False

    def create(self, request, *args, **kwargs):
        data: dict = request.data
        administrator = data.pop('Administrator', None)
        siteManager = data.pop('SiteManager', None)
        grantee = data.pop('SiteManager', None)
        if (administrator != None ):
            data['Administrator'] = administrator
            outcome  = self.createLog(data, AdministratorLogSerializer)
        if (siteManager != None ):
            data['SiteManager'] = siteManager
            outcome = self.createLog(data, SiteManagerLogSerializer)
        if (grantee != None ):
            data['Grantee'] = grantee
            outcome = self.createLog(data, GranteeLogSerializer)
        else:
            outcome = self.createLog(data, CitizenLogSerializer)
        return Response(outcome, HTTP_201_CREATED)