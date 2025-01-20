from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound

# Create your models here.
class CitizenManager(BaseUserManager):
    def get_by_id(self, id):
        try:
            instance = self.get(PublicId=id)
            return instance
        except (ObjectDoesNotExist, ValueError, TypeError):
            raise NotFound('Could Not Find User')

    def create_user(self, UserName,Email, FirstName,Surname,NationalId,DOB,SecondName=None, password=None, **kwargs):
        """Create and return a `User` with an email, phone number, username and password."""
        if UserName is None: raise TypeError('Users must have a username.')
        if FirstName is None: raise TypeError('Users must have a first name .')
        if Surname is None: raise TypeError('Users must have a surname.')
        if NationalId is None: raise TypeError('Users must have a national identification number.')
        if DOB is None: raise TypeError('users must have a date of birth(DOB)')
        if Email is None: raise TypeError('Users must have an email.')
        if password is None: raise TypeError('User must have an email.')
        user = self.model(UserName=UserName, Email=self.normalize_email(Email), FirstName=FirstName, SecondName=SecondName,Surname=Surname,NationalId=NationalId,DOB=DOB, **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
class Citizen(AbstractBaseUser, PermissionsMixin):
    PublicId = models.UUIDField(unique=True, db_index=True, editable=False,default=uuid.uuid4)
    UserName = models.CharField(max_length=100, unique=True)
    FirstName = models.CharField(max_length=100)
    SecondName = models.CharField(max_length=100, null=True)
    Surname = models.CharField(max_length=100)
    NationalId = models.CharField(max_length=40)
    DOB = models.DateTimeField()
    Email = models.EmailField(unique=True)
    EmailVerified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    Created = models.DateTimeField(auto_now_add=True)
    Updated = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'Email'
    REQUIRED_FIELDS = ['UserName']

    objects: CitizenManager = CitizenManager()

    def __str__(self):
        return f'{self.UserName}, {self.Email}'
