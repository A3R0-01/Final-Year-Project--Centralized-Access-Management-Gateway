from django.db import models
from core.abstract.models import AbstractModel, AbstractManager

# Create your models here.
class AssociationManager(AbstractManager):

    pass

class Association(AbstractModel):
    Title = models.CharField(max_length=100, unique=True)
    Email = models.EmailField(unique=True)
    Department = models.ForeignKey(to='department.Department', on_delete=models.PROTECT)
    Website = models.URLField(null=True)

    objects : AssociationManager = AssociationManager()

    def __str__(self):
        return f'{self.Title}, {self.Email}, {self.Administrator.AdministratorUserName}'

    pass

