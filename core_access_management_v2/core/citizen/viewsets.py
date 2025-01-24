from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import NotFound, PermissionDenied, server_error
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from .serializers import CitizenSerializer
from .models import Citizen
# Create your views here.

class CitizenViewSet(ModelViewSet):
    serializer_class = CitizenSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ('get', 'patch')

    def get_queryset(self):
        raise PermissionDenied()

    def get_object(self):
        # id = self.kwargs['pk']
        # citizen = Citizen.objects.get_by_id(id)
        citizen = self.request.user
        try:
            self.check_object_permissions(self.request, citizen)
        except:
            server_error()
        return citizen

