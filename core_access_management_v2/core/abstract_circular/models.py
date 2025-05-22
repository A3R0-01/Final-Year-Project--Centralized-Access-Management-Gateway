from django.db import models
from django.utils import timezone
from core.abstract.models import AbstractManager, AbstractModel

class PermissionsManager(AbstractManager):

    pass

class AbstractPermission(AbstractModel):
    Name = models.CharField(max_length=100)
    Description = models.TextField()
    Citizens = models.ManyToManyField(to='citizen.Citizen')
    StartTime = models.DateTimeField()
    EndTime = models.DateTimeField()

    objects = PermissionsManager()
    @property
    def all_citizens(self):
        citizens : list[str] = []
        for citizen in self.Citizens:
            citizens.append(citizen.UserName)
        return citizens
    @property
    def permission_open(self):
        time = timezone.now()
        if time < self.StartTime:
            return False
        elif time > self.EndTime:
            return False
        else:
            return True

    def __str__(self):
        return f'\n\tName: {self.Name}, \n\tPermissionOpen: {self.permission_open}, \n\tCitizens: {self.Citizens}'

class AbstractLogManager(AbstractManager):
    
    pass

class AbstractLogModel(AbstractModel):
    Citizen = models.ForeignKey(to='citizen.Citizen', on_delete=models.PROTECT)
    Method = models.CharField()
    Object = models.CharField()
    RecordId = models.CharField(null=True)
    IpAddress = models.CharField(max_length=19)
    Message = models.CharField()

    objects : AbstractLogManager = AbstractLogManager()

    def __str__(self):
        return f'Log:: Citizen:{self.Citizen.UserName}, Method: {self.Method}, Record: {self.RecordId}, StatusCode: {self.StatusCode}'
    pass