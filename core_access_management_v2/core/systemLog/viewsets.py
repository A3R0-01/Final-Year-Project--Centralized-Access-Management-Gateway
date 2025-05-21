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

    def runCron(self):
        try:
            import time
            time.sleep(5)
            current_time = timezone.now()
            logger.info(f'System Logs Began Saving at {current_time}')
            kafka_settings : dict[str: str | function ] = getattr(settings, 'SYSTEM_LOG_KAFKA_SETTINGS', None)

            if kafka_settings == None:
                raise Exception('kafka_settings not found')
            consumer = NewKafkaConsumer(**kafka_settings)
            limit = kafka_settings.pop('limit', 300)
            count = 0
            for message in consumer:
                print("i am here")
                if count >= limit:
                    break
                data : dict = message.value
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
                if not outcome:
                    json_string = json.dumps(data, indent=2)
                    logger.warning("Failed to run debug data:\n" + json_string)
                count += 1

            consumer.close()
        except Exception as e:
            logger.warning("Failed to run cron: " + e.args[0])


    def createLog(self, data:dict, serializer_class: AbstractLogSerializer):
        try:
            serializer : AbstractLogSerializer = serializer_class(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            print("created")
            return serializer.data
        except Exception as e:
            print(e)
            return False
    # def create(self, request, *args, **kwargs):
    #     Thread(target=self.runCron()).run()
    #     return Response({"message": "process is running"})
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