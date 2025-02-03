from django.shortcuts import render
from django.db.transaction import atomic
from rest_framework.exceptions import bad_request
from core.administrator.serializers import SiteManagerAdministratorModelSerializer
from core.abstract.viewset import AbstractModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet, AbstractGranteeModelViewSet
from .serializers import CitizenDepartmentSerializer, GranteeDepartmentSerializer, AdministratorDepartmentSerializer, SiteManagerDepartmentSerializer

# Create your views here.

class CitizenDepartmentViewSet(AbstractModelViewSet):
    http_method_names = ('get',)
    serializer_class = CitizenDepartmentSerializer
    pass

class GranteeDepartmentViewSet(AbstractGranteeModelViewSet):
    serializer_class = GranteeDepartmentSerializer

class AdministratorDepartmentViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorDepartmentSerializer

class SiteManagerDepartmentViewSet(AbstractSiteManagerModelViewSet):

    serializer_class = SiteManagerDepartmentSerializer


    @atomic
    def create(self, request, *args, **kwargs):
        administrator = request.data.pop('Administrator', False)
        if not administrator:
            bad_request('Administrator Field is missing')
        elif type(administrator) == dict :
            serializer = SiteManagerAdministratorModelSerializer(data=administrator)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            request.data['Administrator'] = serializer.data['id']
        else:
            request.data['Administrator'] = administrator
        return super().create(request, *args, **kwargs)
