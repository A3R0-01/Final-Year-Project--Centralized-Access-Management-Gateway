from django.db.transaction import atomic
from rest_framework.viewsets import ViewSet
from rest_framework.status import HTTP_201_CREATED
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from core.auth.serializers import RegisterSerializer
from rest_framework.permissions import AllowAny

class RegisterViewSet(ViewSet):
    http_method_names = ['post']
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    @atomic
    def create(self,request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        citizen = serializer.save()
        refresh = RefreshToken.for_user(citizen)
        return Response({
            "citizen": serializer.data,
            "refresh": str(refresh),
            "token": str(refresh.access_token),
        }, status=HTTP_201_CREATED)


