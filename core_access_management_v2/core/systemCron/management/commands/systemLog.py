from django.core.management.base import BaseCommand
from  django.utils import timezone
import logging
from core.systemCron.models import SystemCron

logger = logging.getLogger(__name__)
class Command(BaseCommand):
    help = "System Logs Have Been Pushed"

    def handle(self, *args, **options):
        current_time = timezone.now()
        logger.info(f'System Logs Began Saving at {current_time}')
        cron : SystemCron = SystemCron.objects.create()
        

        fished = cron.finish()
        self.stdout.write(self.style.SUCCESS(f'Cron finished:::::::::: \n\t{success}'))