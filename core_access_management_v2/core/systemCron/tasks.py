from django_cron import CronJobBase, Schedule
from django.utils import timezone
from django.conf import settings
import logging
from core.systemCron.models import SystemCron, systemLog
from core.systemLog.serializers import CitizenLogSerializer, SiteManagerLogSerializer, AdministratorLogSerializer, GranteeLogSerializer
from core.abstract_circular.serializers import AbstractLogSerializer
from core.abstract.kafka import NewKafkaConsumer
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def system_log_cron(self):
    current_time = timezone.now()
    logger.info(f'System Logs Began Saving at {current_time}')
    cron : SystemCron = SystemCron.objects.create(CronName=systemLog, failure=True)
    kafka_settings : dict[str: str | function ] = getattr(settings, 'SYSTEM_LOG_KAFKA_SETTINGS', None)

    if kafka_settings == None:
        cron.Message = 'kafka_settings not found'
        cron.Failure = True
        cron.finish()
        # self.stdout.write(self.style.ERROR(cron))
        return
    consumer = NewKafkaConsumer(**kafka_settings)
    limit = kafka_settings.pop('limit', 300)
    count = 0
    for message in consumer:
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
            # self.stdout.write(self.style.ERROR('failed to createLog: \n'+data+'\n'))
            pass

    consumer.close()
    cron.Success = True
    cron.Message = 'System Log has Been Processed'
    finished = cron.finish()
    # self.stdout.write(self.style.SUCCESS(finished))

def createLog(data:dict, serializer_class: AbstractLogSerializer):
    try:
        serializer : AbstractLogSerializer = serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return True
    except:
        return False