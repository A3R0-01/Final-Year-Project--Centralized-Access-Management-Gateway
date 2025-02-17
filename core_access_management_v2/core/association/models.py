from django.db import models
from core.abstract.models import AbstractModel, AbstractManager

# Create your models here.
class AssociationManager(AbstractManager):

    pass

class Association(AbstractModel):
    Title = models.CharField(max_length=100, unique=True)
    Email = models.EmailField(unique=True)
    Department = models.ForeignKey(to='department.Department', on_delete=models.PROTECT)
    Description = models.TextField()
    Website = models.URLField(null=True)

    objects : AssociationManager = AssociationManager()

    @property
    def get_administrator(self):
        return self.Department.Administrator

    def __str__(self):
        return f'{self.Title}, {self.Email}, {self.Department.Administrator.AdministratorUserName}'

    pass

