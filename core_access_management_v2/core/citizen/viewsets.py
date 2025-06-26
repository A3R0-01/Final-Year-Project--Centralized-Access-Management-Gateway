from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import NotFound, PermissionDenied, server_error, MethodNotAllowed, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from core.abstract.viewset import AbstractSiteManagerModelViewSet, AbstractAdministratorModelViewSet, AbstractGranteeModelViewSet
from .serializers import CitizenSerializer, GranteeCitizenModelSerializer, AdministratorCitizenModelSerializer, SiteManagerCitizenModelSerializer
from .models import Citizen
from pprint import pprint
# Create your views here.

class CitizenViewSet(ModelViewSet):
    serializer_class = CitizenSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ('get', 'patch')

    def update(self, request, *args, **kwargs):
        pprint(request.data)
        if hasattr(request.data, 'password'):
            user = self.request.user
            if user.UserName != request.data['UserName']: raise ValidationError('username incorrect')
            if user.FirstName != request.data['FirstName']: raise ValidationError('first name  incorrect')
            if user.Surname != request.data['Surname']: raise ValidationError('surname incorrect')
            if user.NationalId != request.data['NationalId']: raise ValidationError('national identification number incorrect')
            if user.DOB != request.data['DOB']: raise ValidationError('date of birth (DOB) incorrect')
            if user.Email != request.data['Email']: raise ValidationError('email incorrect')

        obj = super().update(request, *args, **kwargs)
        pprint(obj)
        return obj
    def get_queryset(self):
        raise PermissionDenied('Not Allowed')

    def get_object(self):
        # id = self.kwargs['pk']
        # citizen = Citizen.objects.get_by_id(id)
        citizen = self.request.user
        try:
            self.check_object_permissions(self.request, citizen)
        except:
            server_error()
        return citizen
    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed("This Endpoint Is not allowed")

class GranteeCitizenModelViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('get', 'patch')
    serializer_class = GranteeCitizenModelSerializer


class AdministratorCitizenModelViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get', 'patch')
    serializer_class = AdministratorCitizenModelSerializer
class SiteManagerCitizenModelViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'delete')
    permission_classes = (IsAuthenticated,)
    serializer_class = SiteManagerCitizenModelSerializer



