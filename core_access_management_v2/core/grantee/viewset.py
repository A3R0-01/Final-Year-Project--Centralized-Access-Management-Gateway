from django.shortcuts import render
from rest_framework.exceptions import PermissionDenied
from core.abstract.viewset import AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from core.association.models import Association
from .serializers import GranteeSerializer, AdministratorGranteeSerializer, SiteManagerGranteeSerializer

# Create your views here.
class GranteeModelsViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('patch', 'get')
    serializer_class = GranteeSerializer

    def get_object(self):
        obj = self.request.user.grantee
        self.check_object_permissions(self.request, obj)
        return obj
    
    def get_queryset(self): #get grantees from the same association
        queries = self.get_queries()
        queries['PublicId'] = self.request.user.grantee.PublicId
        return self.serializer_class.Meta.model.objects.filter(**queries)

class AdministratorGranteeViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorGranteeSerializer
    http_method_names = ('patch', 'get', 'post', 'delete')

    def get_queryset(self):
        if hasattr(self.request.user.administrator, 'department' ):
            department = self.request.user.administrator.department
            associations = Association.objects.filter(Department=department)
            queries = self.get_queries()
            queries['Association__in'] = associations
            return self.serializer_class.Meta.model.objects.filter(**queries)
        return PermissionDenied('You do not have a department')

    def create(self, request, *args, **kwargs):
        request.data['Administrator'] = self.request.user.administrator.PublicId.hex
        return super().create(request, *args, **kwargs)
    pass

class SiteManagerGranteeViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerGranteeSerializer
    http_method_names = ('patch', 'get', 'post', 'delete')