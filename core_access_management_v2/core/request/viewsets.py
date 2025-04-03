from django.shortcuts import render
from django.db.transaction import atomic
from rest_framework.exceptions import MethodNotAllowed
from core.abstract.viewset import AbstractModelViewSet, AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from core.department.models import Department
from core.association.models import Association
from .serializers import CitizenRequestSerializer, GranteeRequestSerializer, AdministratorRequestSerializer, SiteManagerRequestSerializer
# Create your views here.

class CitizenRequestViewSet(AbstractModelViewSet):
    serializer_class = CitizenRequestSerializer
    http_method_names = ('get', 'post', 'patch')

    def get_queryset(self):
        queries = self.get_queries()
        queries['Citizen'] = self.request.user
        return self.serializer_class.Meta.model.objects.filter(**queries)
    @atomic
    def create(self, request, *args, **kwargs):
        request.data['Citizen'] = self.request.user.PublicId.hex
        return super().create(request, *args, **kwargs)

class GranteeRequestViewSet(AbstractGranteeModelViewSet):
    serializer_class = GranteeRequestSerializer
    http_method_names = ('get')

    def get_queryset(self):
        if hasattr(self.request.user, 'grantee'):
            queries = self.get_queries()
            queries['PublicService__Grantee'] = self.request.user.grantee
            return self.serializer_class.Meta.model.objects.filter(**queries)
        else:
            raise MethodNotAllowed()

class AdministratorRequestViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorRequestSerializer
    http_method_names = ('get')

    def get_queryset(self):
        if hasattr(self.request.user, 'administrator'):
            department = Department.objects.get(Administrator=self.request.user.administrator)
            associations = Association.objects.filter(Department=department)
            queries = self.get_queries()
            queries['PublicService__Association__in'] = associations
            return self.serializer_class.Meta.model.objects.filter(**queries)
        raise MethodNotAllowed()

class SiteManagerRequestViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerRequestSerializer
    http_method_names = ('get')

