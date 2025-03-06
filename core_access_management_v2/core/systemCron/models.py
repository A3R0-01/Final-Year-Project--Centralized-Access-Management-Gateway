from django.db import models
from core.abstract.models import AbstractManager, AbstractModel
from django.utils  import timezone
systemLog = 'SaveSystemLog'
cron_choices = [
    (systemLog, 'SaveSystemLog')
]

# Create your models here.
class SystemCronManager(AbstractManager):

    pass

class SystemCron(AbstractModel):
    CronName = models.CharField(choices=cron_choices, default=systemLog)
    FinishedAt = models.DateTimeField()
    Success = models.BooleanField(default=False)
    Failure = models.BooleanField(default=False)

    objects : SystemCronManager = SystemCronManager

    def finish(self):
        self.FinishedAt = timezone.now()
        self.save()
        return str(self)
    def __str__(self):
        return f'Cron:: \n\t{self.CronName}, \n\tStarted: {self.Created}, \n\tFinished:{self.FinishedAt}, \n\tSuccess: {self.Success}, \n\tFailure: {self.Failure}'

