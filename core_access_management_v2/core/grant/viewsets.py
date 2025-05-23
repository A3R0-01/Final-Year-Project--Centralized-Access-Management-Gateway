from django.shortcuts import render
from rest_framework.exceptions import MethodNotAllowed
from core.abstract.viewset import AbstractModelViewSet, AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from core.request.models import Request
from core.department.models import Department
from core.association.models import Association
from .serializers import CitizenGrantSerializer, GranteeGrantSerializer, AdministratorGrantSerializer, SiteManagerGrantSerializer
from .models import Grant
# Create your views here.
class CitizenGrantViewSet(AbstractModelViewSet):
    serializer_class = CitizenGrantSerializer
    http_method_names = ('get')

    def get_queryset(self):
        queries = self.get_queries()
        queries['Request__Citizen'] = self.request.user
        return super().get_queryset().filter(**queries)

class GranteeGrantViewSet(AbstractGranteeModelViewSet):
    serializer_class = GranteeGrantSerializer
    http_method_names = ('get', 'patch')

    def get_queryset(self):
        if hasattr(self.request.user, 'grantee'):
            request = Request.objects.filter(PublicService__Grantee=self.request.user.grantee)
            queries = self.get_queries()
            queries['Request__in'] = request
            return self.serializer_class.Meta.model.objects.filter(**queries)
        else:
            raise MethodNotAllowed("GET")

    def update(self, request, *args, **kwargs):
        if hasattr(self.request.user, 'grantee'):
            request.data['Grantee'] = self.request.user.grantee.PublicId.hex
            return super().update(request, *args, **kwargs)
        else:
            raise MethodNotAllowed("PATCH")

class AdministratorGrantViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorGrantSerializer
    http_method_names = ('get')

    def get_queryset(self):
        if hasattr(self.request.user, 'administrator'):
            department = Department.objects.get(Administrator=self.request.user.administrator)
            associations = Association.objects.filter(Department=department)
            requests = Request.objects.filter(PublicService__Association__in=associations)
            queries = self.get_queries()
            queries['Request__in'] = requests
            return self.serializer_class.Meta.model.objects.filter(**queries)
        else:
            raise MethodNotAllowed("GET")

class SiteManagerGrantViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerGrantSerializer
    http_method_names = ('get')

