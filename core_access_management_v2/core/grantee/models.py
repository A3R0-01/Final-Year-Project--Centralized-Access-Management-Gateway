from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from core.abstract.models import AbstractModel, AbstractManager

class GranteeManager(AbstractManager):

    def create(self, **kwargs):
        if hasattr(kwargs['Administrator'], 'department'):
            if kwargs["Association"].Department == kwargs['Administrator'].department:
                return super().create(**kwargs)
    pass

# Create your models here.
class Grantee(AbstractBaseUser, AbstractModel):
    GranteeUserName = models.CharField(max_length=50, unique=True)
    Citizen = models.OneToOneField(to='citizen.Citizen', on_delete=models.PROTECT)
    Administrator = models.ForeignKey(to='administrator.Administrator', on_delete=models.PROTECT)
    Association = models.ForeignKey(to='association.Association', on_delete=models.DO_NOTHING)
    FirstEmail = models.EmailField(unique=True)
    SecondEmail = models.EmailField(unique=True, null=True)

    objects : GranteeManager = GranteeManager()
    USERNAME_FIELD = 'GranteeUserName'
    REQUIRED_FIELDS = ['GranteeUserName', 'Citizen', 'FirstEmail']
    def __str__(self):
        return f'Grantee Account: {self.GranteeUserName}, {self.FirstEmail}, {self.SecondEmail}'
