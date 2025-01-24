from django.db import models
from core.abstract import AbstractModel, AbstractManager

class GranteeManager(AbstractManager):
    pass

# Create your models here.
class Grantee(AbstractModel):
    GranteeUserName = models.CharField(unique=True, max_length=100)
    

    objects : GranteeManager = GranteeManager()
