from django.db import models
from core.abstract_circular.models import AbstractLogModel, AbstractLogManager

# Create your models here.
class CitizenLogManager(AbstractLogManager):

    pass 

class CitizenLog(AbstractLogModel):
    
    objects : CitizenLogManager = CitizenLogManager()

    def __str__(self):
        return f'LOG:: \n\tCitizen: {self.Citizen.UserName}, \n\tObject: {self.Object} \n\tMethod: {self.Method}'
class GranteeLogManager(AbstractLogManager):
    pass
class GranteeLog(AbstractLogModel):
    Grantee = models.CharField()

    objects : GranteeLogManager = GranteeLogManager()

    def __str__(self):
        return f'LOG:: \n\tCitizen: {self.Citizen} \n\tGrantee: {self.Grantee.GranteeUserName}, \n\tObject: {self.Object} \n\tMethod: {self.Method}'

class AdministratorLogManager(AbstractLogManager):

    pass

class AdministratorLog(AbstractLogModel):
    Administrator = models.CharField()
    
    objects : AdministratorLogManager = AdministratorLogManager()

    def __str__(self):
        return f'LOG:: \n\tCitizen: {self.Citizen.UserName} \n\tAdministrator: {self.Administrator}, \n\tObject: {self.Object} \n\tMethod: {self.Method}'


class SiteManagerLogManager(AbstractLogManager):

    pass
class SiteManagerLog(AbstractLogModel):
    SiteManager  = models.CharField()
    objects : SiteManagerLogManager = SiteManagerLogManager()

    def __str__(self):
        return f'LOG:: \n\tCitizen: {self.Citizen.UserName} \n\tManager: {self.SiteManager}, \n\tObject: {self.Object} \n\tMethod: {self.Method}'