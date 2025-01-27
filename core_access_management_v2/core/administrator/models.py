from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from core.abstract.models import AbstractManager, AbstractModel

# Create your models here.

class AdministratorManager(BaseUserManager):
    pass

class Administrator(AbstractBaseUser, PermissionsMixin, AbstractModel):
    AdministratorUserName = models.CharField(max_length=50, unique=True)
    Citizen = models.OneToOneField(to='citizen.Citizen', on_delete=models.PROTECT)
    FirstEmail = models.EmailField(unique=True)
    SecondEmail = models.EmailField(unique=True, null=True)
    GranteeLimit = models.IntegerField(max_digits=2)

    USERNAME_FIELD = 'AdministratorUserName'
    REQUIRED_FIELDS = ['AdministratorUserName']

    objects : AdministratorManager = AdministratorManager()

    def __str__(self):
        return f'Administrator Account: {self.AdministratorUserName}, {self.FirstEmail}, {self.SecondEmail}'