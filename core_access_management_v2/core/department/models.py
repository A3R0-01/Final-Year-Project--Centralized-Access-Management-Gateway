from django.db import models
from core.abstract.models import AbstractManager, AbstractModel

# Create your models here.
class DepartmentManager(AbstractManager):
    pass

class Department(AbstractModel):
    Title = models.CharField(max_length=100, unique=True)
    Administrator = models.OneToOneField(to='administrator.Administrator', on_delete=models.CASCADE)
    Description = models.TextField()
    Email = models.EmailField(unique=True)
    Telephone = models.CharField(unique=True)
    Website = models.URLField(unique=True)

    objects : DepartmentManager = DepartmentManager()

    def __str__(self):
        return f'{self.Title}, {self.Administrator.AdministratorUserName}, {self.Email}'
    
