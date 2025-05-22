from django.db import models
from django.conf import settings
from django.utils import timezone
from core.abstract.models import AbstractModel, AbstractManager

# Create your models here.
class ServiceSessionManager(AbstractManager):

    def create(self, **kwargs):
        kwargs['LastSeen'] = timezone.now()
        return super().create(**kwargs)

    pass

class ServiceSession(AbstractModel):
    Citizen = models.ForeignKey(to='citizen.Citizen', on_delete=models.PROTECT)
    Service = models.ForeignKey(to='publicService.PublicService', on_delete=models.DO_NOTHING)
    IpAddress = models.CharField(max_length=19)
    LastSeen = models.DateTimeField(null=True)
    EnforceExpiry = models.BooleanField(default=False)

    objects : ServiceSessionManager = ServiceSessionManager()

    @property
    def expired(self):
        try:
            sessionHours: int = getattr(settings, "DEFAULT_SESSION_TIME", None)

            if self.EnforceExpiry:
                return True
            if sessionHours is None:
                return False
            
            expiration_time = self.LastSeen + timezone.timedelta(hours=sessionHours)
            return timezone.now() > expiration_time
        except:
            return True