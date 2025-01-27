from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from core.abstract.models import AbstractManager, AbstractModel
from rest_framework.exceptions import PermissionDenied

# Create your models here.
class SiteManagerManager(AbstractManager):

    def create(self, **kwargs):
        if self.all().count() > 0:
            raise PermissionDenied('There Should Only Be One Site Manager.')
        return super().create(**kwargs)
    pass

class SiteManager(AbstractModel, AbstractBaseUser):
    ManagerUserName = models.CharField(unique=True, max_length=100)
    Citizen = models.OneToOneField(to='citizen.Citizen', on_delete=models.PROTECT)
    FirstEmail = models.EmailField(unique=True)
    SecondEmail = models.EmailField(unique=True, null=True)

    objects : SiteManagerManager = SiteManagerManager()
    USERNAME_FIELD = 'FirstEmail'
    REQUIRED_FIELDS = ['ManagerUserName']

    def __str__(self):
        return f'Site Manager Account: {self.ManagerUserName}, {self.FirstEmail}, {self.SecondEmail}'

