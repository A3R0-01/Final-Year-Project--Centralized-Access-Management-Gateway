from django.shortcuts import render
from rest_framework.exceptions import PermissionDenied
from core.abstract.viewset import AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from .serializers import GranteeSerializer, AdministratorGranteeSerializer

# Create your views here.
class GranteeModelsViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('patch', 'get')
    serializer_class = GranteeSerializer

    def get_object(self):
        obj = self.request.user.grantee
        self.check_object_permissions(self.request, obj)
        return obj
    
    def get_queryset(self):
        PermissionDenied('Grantees Are Not Allowed To View Other Profiles')

class AdministratorGranteeViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorGranteeSerializer
    http_method_names = ('patch', 'get', 'post', 'delete')

    def create(self, request, *args, **kwargs):
        request.data['Administrator'] = self.request.user.administrator.PublicId.hex
        return super().create(request, *args, **kwargs)
    pass

class SiteManagerGranteeViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = AdministratorGranteeSerializer
    http_method_names = ('patch', 'get', 'post', 'delete')