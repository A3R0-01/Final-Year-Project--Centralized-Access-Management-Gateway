from django.shortcuts import render
from django.db.transaction import atomic
from rest_framework.exceptions import bad_request, MethodNotAllowed
from core.administrator.serializers import SiteManagerAdministratorModelSerializer
from core.abstract.viewset import AbstractModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet, AbstractGranteeModelViewSet
from .serializers import CitizenDepartmentSerializer, GranteeDepartmentSerializer, AdministratorDepartmentSerializer, SiteManagerDepartmentSerializer

# Create your views here.

class CitizenDepartmentViewSet(AbstractModelViewSet):
    http_method_names = ('get',)
    serializer_class = CitizenDepartmentSerializer
    pass

class GranteeDepartmentViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('get')
    serializer_class = GranteeDepartmentSerializer

class AdministratorDepartmentViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get', 'patch')
    serializer_class = AdministratorDepartmentSerializer
    
    def get_queryset(self):
        if hasattr(self.request.user.administrator, 'department'):
            return self.serializer_class.Meta.model.objects.filter(PublicId=self.request.user.administrator.department.PublicId.hex)
        return MethodNotAllowed("Get")
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
