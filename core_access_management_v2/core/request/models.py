from django.db import models
from django.db.transaction import atomic
from rest_framework.exceptions import APIException
from core.abstract.models import AbstractManager, AbstractModel
from core.grant.models import Grant

# Create your models here.
class RequestManager(AbstractManager):

    @atomic
    def create(self, **kwargs):
        try:
            request = super().create(**kwargs)
            grant_data = {
                "Request": request,
                "Message": "N/A"
            }
            grant = Grant.objects.create(**grant_data)
            return request
        except:
            raise APIException('Failed to create request')
    pass

class Request(AbstractModel):
    Subject = models.CharField(max_length=50)
    Citizen = models.ForeignKey(to='citizen.Citizen', on_delete=models.CASCADE)
    PublicService = models.ForeignKey(to='publicService.PublicService', on_delete=models.CASCADE)
    Message = models.CharField(max_length=500)

    objects : RequestManager = RequestManager()

    def __str__(self):
        if hasattr(self, 'grant'):
            return f'Request:  {self.Citizen.Email}, {self.PublicService.Title}, {self.Message[:20]}, Grant:: {self.grant.granted}'
        else:
            return f'Request:  {self.Citizen.Email}, {self.PublicService.Title}, {self.Message[:20]}, Grant:: N/A'

