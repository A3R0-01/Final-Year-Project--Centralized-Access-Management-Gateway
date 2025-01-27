from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import update_last_login
from core.citizen.serializers import CitizenSerializer
from core.siteManager.serializers import SiteManagerSerializer

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
    def validate(self, attrs):
        data =  super().validate(attrs)
        refresh = self.get_token(self.user)
        if hasattr(self.user, 'siteManager'):
            ManagerPassword, ManagerUserName = attrs['ManagerPassword'], attrs['ManagerUserName']
            if ManagerPassword == self.user.check_password(ManagerPassword) and ManagerUserName == self.user.siteManager.ManagerUserName:
                data['user'] = SiteManagerSerializer(self.user.siteManager).data
                data['refresh'] = str(refresh)
                data['access'] = str(refresh.access_token)
                if api_settings.UPDATE_LAST_LOGIN:
                    update_last_login(None, self.user)
                return data

        AuthenticationFailed('Invalid Credentials')