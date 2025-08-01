from django.db import models
from django.utils import timezone
from datetime import datetime
from core.abstract.models import AbstractManager, AbstractModel

# Create your models here.
class GrantManager(AbstractManager):
    pass

class Grant(AbstractModel):
    Message = models.CharField(max_length=300)
    Request = models.OneToOneField(to='request.Request', on_delete=models.CASCADE)
    Grantee = models.ForeignKey(to='grantee.Grantee', on_delete=models.CASCADE, null=True)
    Decline = models.BooleanField(default=False)
    StartDate = models.DateTimeField(null=True)
    EndDate = models.DateTimeField(null=True)

    objects : GrantManager = GrantManager()

    @property
    def granted(self):
        now = timezone.now()
        if self.Decline:
            return False
        elif self.StartDate == None:
            return False
        elif self.StartDate > now:
            return False
        elif self.EndDate < now:
            return False
        elif self.EndDate == None:
            return True
        return True

    def __str__(self):
        if self.Grantee:
            grantee = self.Grantee.GranteeUserName
        else:
            grantee = "N/A"
        return f'Grant: {self.Request.PublicId}, GranteeUserName-{grantee}, Decline:: {self.Decline}, Granted:: {self.granted}'