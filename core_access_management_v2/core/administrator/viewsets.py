from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from core.abstract.viewset import AbstractSiteManagerModelViewSet, AbstractAdministratorModelViewSet
from .serializers import SiteManagerAdministratorModelSerializer, AdministratorModelSerializer


# Create your views here.
class AdministratorModelViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('patch', 'get')
    serializer_class = AdministratorModelSerializer

    def get_object(self):
        obj = self.request.user.administrator
        self.check_object_permissions(self.request, obj=obj)
        return obj
    
    def get_queryset(self):
        PermissionDenied('Administrators Are Not Allowed To Access This Method')

class SiteManagerAdministratorModelViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerAdministratorModelSerializer
    http_method_names = ('patch', 'get', 'post', 'delete')
    permission_classes = (IsAuthenticated,)
