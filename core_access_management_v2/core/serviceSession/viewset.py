from django.shortcuts import render
from core.abstract.viewset import AbstractAdministratorModelViewSet, AbstractGranteeModelViewSet, AbstractSiteManagerModelViewSet
from .serializers import SiteManagerServiceSessionSerializer, AdministratorServiceSessionSerializer, GranteeServiceSessionSerializer
# Create your views here.
class GranteeServiceSessionViewSet(AbstractGranteeModelViewSet):
    serializer_class = GranteeServiceSessionSerializer
    http_method_names = ('get')


class AdministratorServiceSessionViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorServiceSessionSerializer
    http_method_names = ('get')

class SiteManagerServiceSessionViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerServiceSessionSerializer
    http_method_names = ('get', 'post', 'patch')