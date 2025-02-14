from django.db import models
from core.abstract.models import AbstractManager, AbstractModel

# Create your models here.
class RequestManager(AbstractManager):
    pass

class Request(AbstractModel):
    Subject = models.CharField(max_length=50)
    Citizen = models.ForeignKey(to='citizen.Citizen', on_delete=models.PROTECT)
    PublicService = models.ForeignKey(to='publicService.PublicService', on_delete=models.PROTECT)
    Message = models.CharField(max_length=500)
    Grant = models.OneToOneField(to='grant.Grant', on_delete=models.PROTECT)

    objects : RequestManager = RequestManager()

    def __str__(self):
        return f'Request:  {self.Citizen.Email}, {self.PublicService.Title}, {self.Message[:20]}, Grant:: {self.Grant.PublicId}'

