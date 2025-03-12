from django.db import models
from rest_framework.exceptions import ValidationError
from core.abstract.models import AbstractManager, AbstractModel
# from core.grantee.models import Grantee
from pprint import pprint

# Create your models here.
class PublicServiceManager(AbstractManager):

    def create(self, **kwargs):
        pprint(kwargs)
        for grantee in kwargs['Grantee'] :
            if kwargs['Association'] != grantee.Association: raise ValidationError("Association and Grantee Do not match")
        grantee = kwargs.pop('Grantee', [])
        model : PublicService = self.model(**kwargs)
        pprint(grantee)
        # model.Grantee.set(grantee)
        model.save(using=self._db)
        model.Grantee.set(grantee)
        model.save(using=self._db)
        return model

    pass

class PublicService(AbstractModel):
    Title = models.CharField(max_length=100, unique=True)
    MachineName = models.CharField(max_length=150, unique=True)
    Description = models.TextField()
    Email = models.EmailField()
    Grantee = models.ManyToManyField(to='grantee.Grantee')
    Association = models.ForeignKey(to='association.Association', on_delete=models.PROTECT)
    Restricted = models.BooleanField(default=False)
    URL = models.URLField(unique=True)
    Visibility = models.BooleanField(default=True)


    objects : PublicServiceManager = PublicServiceManager()

    @property
    def get_grantee(self):
        text = ''
        pprint(self.Grantee)
        for grantee in self.Grantee.all():
            text += f'\n\t\t {grantee.GranteeUserName}'
        pprint(text).__str__
        return text

    def __str__(self):
        return f'PublicService: \n\t{self.Title}, \n\tAssociation({self.Association}), \n\tEmail({self.Email}, \n\tGrantee({self.get_grantee}))'

