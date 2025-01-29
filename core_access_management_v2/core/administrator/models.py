from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from core.abstract.models import AbstractManager, AbstractModel
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.

class AdministratorManager(BaseUserManager, AbstractManager):
    pass

class Administrator(AbstractBaseUser, AbstractModel):
    AdministratorUserName = models.CharField(max_length=50, unique=True)
    Citizen = models.OneToOneField(to='citizen.Citizen', on_delete=models.PROTECT)
    FirstEmail = models.EmailField(unique=True)
    SecondEmail = models.EmailField(unique=True, null=True)
    GranteeLimit = models.IntegerField(validators=[
        MinValueValidator(10), MaxValueValidator(100)
    ])

    USERNAME_FIELD = 'AdministratorUserName'
    REQUIRED_FIELDS = ['AdministratorUserName']

    objects : AdministratorManager = AdministratorManager()

    def __str__(self):
        return f'Administrator Account: {self.AdministratorUserName}, {self.FirstEmail}, {self.SecondEmail}'