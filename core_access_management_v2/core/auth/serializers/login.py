from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework.fields import empty
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import update_last_login
from core.citizen.serializers import CitizenSerializer
from core.siteManager.serializers import SiteManagerSerializer
from core.administrator.serializers import AdministratorModelSerializer
from core.grantee.serializers import GranteeSerializer
from pprint import pprint

INVALID_DATA = {
                    'access': 'denied',
                    'code': 'bad request'
                }
class LoginCitizenSerializer(TokenObtainPairSerializer):
    

    def validate(self, attrs):
        data =  super().validate(attrs)
        refresh = self.get_token(self.user)

        data['user'] = CitizenSerializer(self.user).data
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data

class LoginSiteManagerSerializer(TokenObtainPairSerializer):
    ManagerPassword = None
    ManagerUserName = None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ManagerPassword = kwargs['data']['ManagerPassword']
        self.ManagerUserName = kwargs['data']['ManagerUserName']

    def validate(self, attrs):
        data =  super().validate(attrs)
        refresh = self.get_token(self.user)
        if hasattr(self.user, 'sitemanager'):
            # ManagerPassword, ManagerUserName = attrs['ManagerPassword'], attrs['ManagerUserName']
            if self.user.sitemanager.check_password(self.ManagerPassword) and self.ManagerUserName == self.user.sitemanager.ManagerUserName:
                data['user'] = SiteManagerSerializer(self.user.sitemanager).data
                data['refresh'] = str(refresh)
                data['access'] = str(refresh.access_token)
                if api_settings.UPDATE_LAST_LOGIN:
                    update_last_login(None, self.user)
                return data


        return INVALID_DATA

    def is_valid(self, *, raise_exception=False):
        return super().is_valid(raise_exception=raise_exception)

class LoginAdministratorSerializer(TokenObtainPairSerializer):
    AdministratorPassword = None
    AdministratorUserName = None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.AdministratorPassword = kwargs['data']['AdministratorPassword']
        self.AdministratorUserName = kwargs['data']['AdministratorUserName']

    def validate(self, attrs):
        data =  super().validate(attrs)
        refresh = self.get_token(self.user)
        if hasattr(self.user, 'administrator'):
            # ManagerPassword, ManagerUserName = attrs['ManagerPassword'], attrs['ManagerUserName']
            if self.user.administrator.check_password(self.AdministratorPassword) and self.AdministratorUserName == self.user.administrator.AdministratorUserName:
                data['user'] = AdministratorModelSerializer(self.user.administrator).data
                data['refresh'] = str(refresh)
                data['access'] = str(refresh.access_token)
                if api_settings.UPDATE_LAST_LOGIN:
                    update_last_login(None, self.user)
                return data


        return INVALID_DATA

class LoginGranteeSerializer(TokenObtainPairSerializer):
    GranteePassword = None
    GranteeUserName = None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.GranteePassword = kwargs['data']['GranteePassword']
        self.GranteeUserName = kwargs['data']['GranteeUserName']

    def validate(self, attrs):
        data =  super().validate(attrs)
        refresh = self.get_token(self.user)
        if hasattr(self.user, 'grantee'):
            # ManagerPassword, ManagerUserName = attrs['ManagerPassword'], attrs['ManagerUserName']
            if self.user.grantee.check_password(self.GranteePassword) and self.GranteeUserName == self.user.grantee.GranteeUserName:
                data['user'] = GranteeSerializer(self.user.grantee).data
                data['refresh'] = str(refresh)
                data['access'] = str(refresh.access_token)
                if api_settings.UPDATE_LAST_LOGIN:
                    update_last_login(None, self.user)
                return data


        return INVALID_DATA
