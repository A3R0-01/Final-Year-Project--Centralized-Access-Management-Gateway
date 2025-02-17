from django.shortcuts import render
from rest_framework.exceptions import MethodNotAllowed
from core.abstract.viewset import AbstractModelViewSet, AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from .serializers import CitizenGrantSerializer, GranteeGrantSerializer, AdministratorGrantSerializer, SiteManagerGrantSerializer
from .models import Grant
# Create your views here.
class CitizenGrantViewSet(AbstractModelViewSet):
    serializer_class = CitizenGrantSerializer
    http_method_names = ('get')

class GranteeGrantViewSet(AbstractGranteeModelViewSet):
    serializer_class = GranteeGrantSerializer
    http_method_names = ('get', 'patch')

    def get_queryset(self):
        if hasattr(self.request.user, 'grantee'):
            return Grant.objects.filter(Grantee=self.request.user.grantee)
        else:
            raise MethodNotAllowed()

    def update(self, request, *args, **kwargs):
        if hasattr(self.request.user, 'grantee'):
            request.data['Grantee'] = self.request.user.grantee.PublicId.hex
            return super().update(request, *args, **kwargs)
        else:
            raise MethodNotAllowed()

class AdministratorGrantViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorGrantSerializer
    http_method_names = ('get')

class SiteManagerGrantViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerGrantSerializer
    http_method_names = ('get')

