from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound
import uuid

# Create your models here.
class AbstractManager(models.Manager):

    def get_by_id(self, id: str) -> models.Model:
        try:
            instance = self.get(id)
            return instance
        except (ObjectDoesNotExist, ValueError, TypeError):
            raise NotFound()

class AbstractModel(models.Model):
    PublicId = models.UUIDField(unique=True, db_index=True, default=uuid.uuid4, editable=False)
    Created = models.DateTimeField(auto_now_add=True)
    Updated = models.DateTimeField(auto_now=True)

    objects:AbstractManager = AbstractManager()

    class Meta:
        abstract = True