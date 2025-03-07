from django.db import models
from core.abstract.models import AbstractPermission
from datetime import datetime

# Create your models here.
class PublicServicePermission(AbstractPermission):
    PublicService = models.ForeignKey(to='publicService.PublicService', on_delete=models.CASCADE)

    def __str__(self):
        return f'PublicServicePermission: \n\tService:{self.PublicService.Title}, {super().__str__()}'

class AssociationPermission(AbstractPermission):
    Association = models.ForeignKey(to='assocation.Association', on_delete=models.CASCADE)

    def __str__(self):
        return f'AssociationPermission: \n\tAssocation: {self.Association.Title}, {super().__str__()}'
    
class DepartmentPermission(AbstractPermission):
    Department  = models.ForeignKey(to='department.Department', on_delete=models.CASCADE)

    def __str__(self):
        return f'DepartmentPermission: \n\tDepartment: {self.Department.Title}, {super().__str__()}'