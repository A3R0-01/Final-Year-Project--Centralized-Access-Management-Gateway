from django.db import models
from datetime import datetime
from core.abstract.models import AbstractManager, AbstractModel

# Create your models here.
class GrantManager(AbstractManager):
    pass

class Grant(AbstractModel):
    Request = models.OneToOneField(to='request.Request', on_delete=models.PROTECT)
    Grantee = models.ForeignKey(to='grantee.Grantee', on_delete=models.PROTECT)
    StartDate = models.DateTimeField(null=True)
    EndDate = models.DateTimeField(null=True)

    objects : GrantManager = GrantManager()

    def granted(self):
        now = datetime.now()
        if self.StartDate == None:
            return False
        elif self.StartDate > now:
            return False
        elif self.EndDate < now:
            return False
        elif self.EndDate == None:
            return True
        return True

    def __str__(self):
        return f'Grant: {self.Request.PublicId}, GranteeUserName-{self.Grantee.GranteeUserName}, '