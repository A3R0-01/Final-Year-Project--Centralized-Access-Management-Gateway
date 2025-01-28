from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from rest_framework.exceptions import NotFound, PermissionDenied, AuthenticationFailed
from django.core.exceptions import ObjectDoesNotExist
from core.siteManager.models import SiteManager

class IsSiteManager(JWTAuthentication):
    def authenticate(self, request):
        # ManagerPassword, ManagerUserName = request.data['ManagerPassword'], request.data['ManagerUserName']
        authenticatedUser, token =super().authenticate(request)
        if hasattr(authenticatedUser, 'sitemanager'):
            # siteManager: SiteManager = authenticatedUser.siteManager
            # if siteManager.ManagerUserName == ManagerUserName and siteManager.check_password(ManagerPassword):
            return authenticatedUser, token
        AuthenticationFailed('Invalid Credentials. Please Login')

class IsAdministrator(JWTAuthentication):
    def authenticate(self, request):
        authenticatedUser, token = super().authenticate(request)
        if hasattr(authenticatedUser, 'administrator') or hasattr(authenticatedUser, 'sitemanager'):
            return authenticatedUser, token
        AuthenticationFailed('Invalid Credentials. Please Login')

class IsGrantee(JWTAuthentication):

    def authenticate(self, request):
        authenticatedUser, token = super().authenticate(request)
        if hasattr(authenticatedUser, 'grantee') or hasattr(authenticatedUser, 'administrator') or hasattr(authenticatedUser, 'sitemanager'):
            return authenticatedUser, token
        AuthenticationFailed('Invalid Credentials. Please Login')
