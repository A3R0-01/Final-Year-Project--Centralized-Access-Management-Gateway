from core.auth.serializers import LoginCitizenSerializer, LoginSiteManagerSerializer, LoginAdministratorSerializer, LoginGranteeSerializer, INVALID_DATA
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import AllowAny
from rest_framework.status import HTTP_200_OK
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from pprint import pprint

class LoginCitizenViewSet(ViewSet):
    serializer_class = LoginCitizenSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        return Response(serializer.validated_data, status=HTTP_200_OK)

class LoginGranteeViewSet(ViewSet):
    serializer_class = LoginGranteeSerializer
    permission_classes = (AllowAny,)
    http_method_names = ('post',)

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        data = serializer.validated_data
        # if data == INVALID_DATA:
        #     AuthenticationFailed()
        return Response(serializer.validated_data, HTTP_200_OK)

class LoginAdministratorViewSet(LoginGranteeViewSet):
    serializer_class = LoginAdministratorSerializer
class LoginSiteManagerViewSet(LoginAdministratorViewSet):
    serializer_class = LoginSiteManagerSerializer
    