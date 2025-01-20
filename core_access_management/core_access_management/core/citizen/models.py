from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ObjectDoesNotExist

# Create your models here.
class CitizenManager(BaseUserManager):
    pass
class Citizen(AbstractBaseUser, PermissionsMixin):
    PublicId = models.UUIDField(unique=True, db_index=True, editable=False,default=uuid.uuid4)
    UserName = models.CharField(max_length=100, unique=True)
    FirstName = models.CharField(max_length=100)
    SecondName = models.CharField(max_length=100)
    Surname = models.CharField(max_length=100)
    NationalId = models.CharField(max_length=40)
    DOB = models.DateTimeField()
    Email = models.EmailField(unique=True, db_index=True)
    EmailVerified = models.BooleanField(default=False)
    

    Created = models.DateTimeField(auto_now_add=True)
    Updated = models.DateTimeField(auto_now=True)

    pass
