from django.shortcuts import render
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from core.abstract.viewset import AbstractSiteManagerModelViewSet, AbstractAdministratorModelViewSet, AbstractGranteeModelViewSet
from core.association.models import Association
from core.publicService.models import PublicService
from core.department.models import Department
from core.grantee.models import Grantee
from .serializer import PublicServicePermissionSerializer, AssociationPermissionSerializer, DepartmentPermissionSerializer

# Create your views here.
class SiteManagerPublicServicePermissionViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'patch', 'delete', 'post')
    serializer_class = PublicServicePermissionSerializer
    

class SiteManagerAssociationPermissionViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'patch', 'delete', 'post')
    serializer_class = AssociationPermissionSerializer
    

class SiteManagerDepartmentPermissionViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'patch', 'delete', 'post')
    serializer_class = DepartmentPermissionSerializer
    

class GranteePublicServicePermissionViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('get', 'patch', 'delete', 'post')
    serializer_class = PublicServicePermissionSerializer
    
    def get_queryset(self):
        grantee : Grantee = self.request.user.grantee
        publicServices = PublicService.objects.filter(Grantee=grantee)
        return self.serializer_class.Meta.model.objects.filter(PublicService__in=publicServices)
    
    
    def create(self, request, *args, **kwargs):
        grantee = self.request.user.grantee
        publicServiceId = request.data.pop('PublicService', None)
        if publicServiceId == None:
            raise ValidationError('Invalid Service')
        if hasattr(grantee, 'association'):
            try:
                publicSrvc =PublicService.objects.filter(Grantee=grantee).get_by_id(publicServiceId)
                request.data['PublicService'] = publicSrvc.PublicId.hex
            except:
                raise ValidationError('Invalid Service')

            return super().create(request, *args, **kwargs)
        raise ValidationError('You Do Not Belong to any Association')

class AdministratorPublicServicePermissionViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get', 'patch', 'delete', 'post')
    serializer_class = PublicServicePermissionSerializer
    
    def get_queryset(self):
        administrator = self.request.user.administrator
        if hasattr(administrator, 'department'):
            associations = Association.objects.filter(Department=administrator.department)
            publicServices = PublicService.objects.filter(Association__in=associations)
            return self.serializer_class.Meta.model.objects.filter(PublicService__in=publicServices)
        raise MethodNotAllowed()
    
    def create(self, request, *args, **kwargs):
        administrator = self.request.user.administrator
        publicServiceId = request.data.pop('PublicService', None)
        if publicServiceId == None:
            raise ValidationError('Invalid Service')
        if hasattr(administrator, 'department'):
            try:
                associations = Association.objects.filter(Department=administrator.department)
                publicSrvc =PublicService.objects.filter(Association__in=associations).get_by_id(publicServiceId)
                request.data['PublicService'] = publicSrvc.PublicId.hex
            except:
                raise ValidationError('Invalid Service')

            return super().create(request, *args, **kwargs)
        raise MethodNotAllowed('You Do Not Belong to Any Department')


class AdministratorAssociationPermissionViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get', 'patch', 'delete', 'post')
    serializer_class = AssociationPermissionSerializer
    
    def get_queryset(self):
        administrator = self.request.user.administrator
        if hasattr(administrator, 'department'):
            associations = Association.objects.filter(Department=administrator.department)
            return self.serializer_class.Meta.model.objects.filter(Association__in=associations)
        raise MethodNotAllowed('You Do Not Belong to Any Department')
    
    def create(self, request, *args, **kwargs):
        administrator = self.request.user.administrator
        associationId = request.data.pop('Association', None)
        if associationId == None:
            raise ValidationError('Invalid Association')
        if hasattr(administrator, 'department'):
            try:
                association = Association.objects.filter(Department=administrator.department).get_by_id(associationId)
                request.data['Association'] = association.PublicId.hex
            except:
                raise ValidationError('Invalid Association')

            return super().create(request, *args, **kwargs)
        raise MethodNotAllowed('You Do Not Belong to Any Department')

class AdministratorDepartmentPermissionViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get', 'patch', 'delete', 'post')
    serializer_class = DepartmentPermissionSerializer

    def get_queryset(self):
        administrator = self.request.user.administrator
        if hasattr(administrator, 'department'):
            return self.serializer_class.Meta.model.objects.filter(Department=administrator.department)
        raise MethodNotAllowed('You Do Not Belong to Any Department')
    
    def create(self, request, *args, **kwargs):
        administrator = self.request.user.administrator
        if hasattr(administrator, 'department'):
            request.data['Department'] = administrator.department
            return super().create(request, *args, **kwargs)
        raise MethodNotAllowed('You Do Not Belong to Any Department')
