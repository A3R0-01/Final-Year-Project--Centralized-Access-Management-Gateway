from django.db import models
from core.abstract.models import AbstractManager, AbstractModel

# Create your models here.

class ServiceManager(AbstractManager):

    pass

class Service(AbstractModel):
    Title = models.CharField(max_length=100, unique=True)
    Description = models.TextField()
    Email = models.EmailField()
    Grantee = models.ForeignKey(to='grantee.Grantee', on_delete=models.PROTECT)
    Association = models.ForeignKey(to='association.Association', on_delete=models.PROTECT)

    objects : ServiceManager = ServiceManager()

    def __str__(self):
        return f'Service: {self.Title}, Association({self.Association.Title}), Email({self.Email}, Grantee({self.Grantee.GranteeUserName}))'

