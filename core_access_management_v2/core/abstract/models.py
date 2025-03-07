from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound
from datetime import datetime
import uuid

# Create your models here.
class AbstractManager(models.Manager):

    def get_by_id(self, id: str) -> models.Model:
        try:
            instance = self.get(PublicId=id)
            return instance
        except (ObjectDoesNotExist, ValueError, TypeError):
            raise NotFound()

class AbstractModel(models.Model):
    PublicId = models.UUIDField(unique=True, db_index=True, default=uuid.uuid4, editable=False)
    Created = models.DateTimeField(auto_now_add=True)
    Updated = models.DateTimeField(auto_now=True)

    objects:AbstractManager = AbstractManager()

    def get_model_fields(self) -> list[str]:
        fields = self._meta.get_fields()
        attributes = [field.name for field in fields if field.concrete]
        return attributes
    class Meta:
        abstract = True


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
        time = datetime.now()
        if time < self.StartTime:
            return False
        elif time > self.EndTime:
            return False
        else:
            return True

    def __str__(self):
        return f'\n\tName: {self.Name}, \n\tPermissionOpen: {self.permission_open}, \n\tCitizens: {self.Citizens}'
    