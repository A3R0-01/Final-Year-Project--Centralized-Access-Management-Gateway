from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
import logging
from core.systemCron.models import SystemCron, systemLog
from core.systemLog.models import CitizenLog, SiteManagerLog, GranteeLog, AdministratorLog
from core.abstract.kafka import NewKafkaConsumer

logger = logging.getLogger(__name__)
class Command(BaseCommand):
    help = "System Logs Have Been Pushed"

    def handle(self, *args, **options):
        current_time = timezone.now()
        logger.info(f'System Logs Began Saving at {current_time}')
        cron : SystemCron = SystemCron.objects.create(CronName=systemLog)
        kafka_settings : dict[str: str | function ] = getattr(settings, 'SYSTEM_LOG_KAFKA_SETTINGS', None)

        if kafka_settings == None:
            cron.Message = 'kafka_settings not found'
            cron.Failure = True
            cron.finish()
            self.stdout.write(self.style.ERROR(cron))
            return
        consumer = NewKafkaConsumer(**kafka_settings)
        limit = kafka_settings.pop('limit', 300)
        count = 0
        for message in consumer:
            if count >= limit:
                break


        finished = cron.finish()
        self.stdout.write(self.style.SUCCESS(cron))