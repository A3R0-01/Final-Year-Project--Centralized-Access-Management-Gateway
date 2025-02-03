from django.shortcuts import render
from django.db.transaction import atomic
from django.db.utils import IntegrityError
from rest_framework.status import HTTP_201_CREATED
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed, bad_request
from core.department.serializers import SiteManagerDepartmentSerializer
from core.abstract.viewset import AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet, AbstractModelViewSet
from .serializers import CitizenAssociationModelSerializer, GranteeAssociationModelSerializer, AdministratorAssociationModelSerializer, SiteManagerAssociationModelSerializer

# Create your views here.
class CitizenAssociationModelViewSet(AbstractModelViewSet):
    http_method_names : tuple[str] = ('get',)
    serializer_class: CitizenAssociationModelSerializer = CitizenAssociationModelSerializer


class GranteeAssociationModelViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('get',)
    serializer_class = GranteeAssociationModelSerializer

class AdministratorAssociationModelViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get', 'patch', 'post')
    serializer_class = AdministratorAssociationModelSerializer

    @atomic
    def create(self, request, *args, **kwargs):
        if hasattr(self.request.user.administrator, 'department'):
            request.data['Department'] = self.request.user.administrator.department.PublicId.hex
            serializer = SiteManagerAssociationModelSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, HTTP_201_CREATED)
        raise MethodNotAllowed('You haven\'t been assigned to a department yet')

class SiteManagerAssociationModelViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'patch', 'post')
    serializer_class = SiteManagerAssociationModelSerializer

    @atomic
    def create(self, request, *args, **kwargs):
        try:
                
            department = request.data.pop('Department', False)
            if not department:
                return bad_request('Missing field')
            elif type(department) == dict:
                serializer = SiteManagerDepartmentSerializer(data=department)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                request.data['Department'] = serializer.data['id']
            else:
                request.data['Department'] = department
            return super().create(request, *args, **kwargs)
        except (IntegrityError) as e:
            return bad_request('Element Duplicate Element', e)

