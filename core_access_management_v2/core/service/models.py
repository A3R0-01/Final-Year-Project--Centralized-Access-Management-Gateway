from django.db import models
from rest_framework.exceptions import ValidationError
from core.abstract.models import AbstractManager, AbstractModel
from core.grantee.models import Grantee

# Create your models here.
class TransportManager(AbstractManager):

    pass

class Transport(AbstractModel):
    Name = models.CharField(max_length='100', unique=True)
    

class ServiceManager(AbstractManager):

    def create(self, **kwargs):
        if kwargs['Association'] == kwargs['Grantee'].Association: return super().create(**kwargs)
        raise ValidationError("Association and Grantee Do not match")

    pass

class Service(AbstractModel):
    Title = models.CharField(max_length=100, unique=True)
    MachineName = models.CharField(max_length=150, unique=True)
    Description = models.TextField()
    Email = models.EmailField()
    Grantee = models.ManyToManyField(to='grantee.Grantee', on_delete=models.PROTECT)
    Association = models.ForeignKey(to='association.Association', on_delete=models.PROTECT)
    URL = models.URLField(unique=True)


    objects : ServiceManager = ServiceManager()

    def __str__(self):
        return f'Service: {self.Title}, Association({self.Association.Title}), Email({self.Email}, Grantee({self.Grantee.GranteeUserName}))'

