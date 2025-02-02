from django.shortcuts import render
from core.abstract.viewset import AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from .serializers import GranteeAssociationModelSerializer, AdministratorAssociationModelSerializer, SiteManagerAssociationModelSerializer

# Create your views here.

class GranteeAssociationModelViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('get',)
    serializer_class = GranteeAssociationModelSerializer

class AdministratorAssociationModelViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get', 'patch')
    serializer_class = AdministratorAssociationModelSerializer

class SiteManagerAssociationModelViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'patch', 'post')
    serializer_class = SiteManagerAssociationModelSerializer

