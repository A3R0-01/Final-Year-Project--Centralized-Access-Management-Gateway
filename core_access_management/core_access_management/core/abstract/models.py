from django.db import models
import uuid

# Create your models here.
class AbstractManager(models.Manager):
    pass

class AbstractModel(models.Model):
    PublicId = models.UUIDField(unique=True, db_index=True, default=uuid.uuid4, editable=False)
    Created = models.DateTimeField(auto_now_add=True)
    Updated = models.DateTimeField(auto_now=True)

    objects = AbstractManager()

    class Meta:
        abstract = True