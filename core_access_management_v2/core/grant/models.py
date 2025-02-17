from django.db import models
from datetime import datetime
from core.abstract.models import AbstractManager, AbstractModel

# Create your models here.
class GrantManager(AbstractManager):
    pass

class Grant(AbstractModel):
    Message = models.CharField(max_length=300)
    Request = models.OneToOneField(to='request.Request', on_delete=models.PROTECT)
    Grantee = models.ForeignKey(to='grantee.Grantee', on_delete=models.PROTECT, null=True)
    Decline = models.BooleanField(default=False)
    StartDate = models.DateTimeField(null=True)
    EndDate = models.DateTimeField(null=True)

    objects : GrantManager = GrantManager()

    @property
    def granted(self):
        now = datetime.now()
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
        return f'Grant: {self.Request.PublicId}, GranteeUserName-{self.Grantee.GranteeUserName}, Decline:: {self.Decline}, Granted:: {self.granted}'