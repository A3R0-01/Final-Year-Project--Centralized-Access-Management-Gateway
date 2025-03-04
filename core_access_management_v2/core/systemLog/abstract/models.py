from django.db import models
from core.abstract.models import AbstractManager, AbstractModel

class AbstractLogManager(AbstractManager):
    
    pass

class AbstractLogModel(AbstractModel):
    Citizen = models.ForeignKey(to='citizen.Citizen', on_delete=models.PROTECT)
    Method = models.CharField()
    Object = models.CharField()
    RecordId = models.CharField(null=True)
    StatusCode = models.IntegerField()
    Message = models.CharField()

    objects : AbstractLogManager = AbstractLogManager()

    def __str__(self):
        return f'Log:: Citizen:{self.Citizen.UserName}, Method: {self.Method}, Record: {self.RecordId}, StatusCode: {self.StatusCode}'
    pass