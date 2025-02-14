from django.db import models
from rest_framework.exceptions import ValidationError
from core.abstract.models import AbstractManager, AbstractModel
from core.grantee.models import Grantee

# Create your models here.
class PublicServiceManager(AbstractManager):

    def create(self, **kwargs):
        if kwargs['Association'] == kwargs['Grantee'].Association: return super().create(**kwargs)
        raise ValidationError("Association and Grantee Do not match")

    pass

class PublicService(AbstractModel):
    Title = models.CharField(max_length=100, unique=True)
    MachineName = models.CharField(max_length=150, unique=True)
    Description = models.TextField()
    Email = models.EmailField()
    Grantee = models.ManyToManyField(to='grantee.Grantee')
    Association = models.ForeignKey(to='association.Association', on_delete=models.PROTECT)
    URL = models.URLField(unique=True)
    Visibility = models.BooleanField(default=True)


    objects : PublicServiceManager = PublicServiceManager()

    def __str__(self):
        return f'PublicService: {self.Title}, Association({self.Association.Title}), Email({self.Email}, Grantee({self.Grantee.GranteeUserName}))'

