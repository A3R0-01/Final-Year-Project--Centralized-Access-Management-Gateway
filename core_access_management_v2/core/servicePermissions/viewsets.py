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
        queries = self.get_queries()
        queries['PublicService__in'] = publicServices
        return self.serializer_class.Meta.model.objects.filter(**queries)
    
    
    def create(self, request, *args, **kwargs):
        grantee = self.request.user.grantee
        publicServiceId = request.data.pop('PublicService', None)
        if publicServiceId == None:
            raise ValidationError('Invalid Service')
        if hasattr(grantee, 'association'):
            try:
                publicSrvc =PublicService.objects.filter(Grantee=grantee).get(PublicId=publicServiceId)
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
            queries = self.get_queries()
            queries['PublicService__in'] = publicServices
            return self.serializer_class.Meta.model.objects.filter(**queries)
        raise MethodNotAllowed()
    
    def create(self, request, *args, **kwargs):
        administrator = self.request.user.administrator
        publicServiceId = request.data.pop('PublicService', None)
        if publicServiceId == None:
            raise ValidationError('Invalid Service')
        if hasattr(administrator, 'department'):
            try:
                associations = Association.objects.filter(Department=administrator.department)
                publicSrvc =PublicService.objects.filter(Association__in=associations).get(PublicId=publicServiceId)
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
            queries = self.get_queries()
            queries['Association__in'] = associations
            return self.serializer_class.Meta.model.objects.filter(**queries)
        raise MethodNotAllowed('You Do Not Belong to Any Department')
    
    def create(self, request, *args, **kwargs):
        administrator = self.request.user.administrator
        associationId = request.data.pop('Association', None)
        if associationId == None:
            raise ValidationError('Invalid Association')
        if hasattr(administrator, 'department'):
            try:
                association = Association.objects.filter(Department=administrator.department).get(PublicId=associationId)
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
            queries = self.get_queries()
            queries['Department'] = administrator.department
            return self.serializer_class.Meta.model.objects.filter(**queries)
        raise MethodNotAllowed('You Do Not Belong to Any Department')
    
    def create(self, request, *args, **kwargs):
        administrator = self.request.user.administrator
        if hasattr(administrator, 'department'):
            request.data['Department'] = administrator.department.PublicId.hex
            return super().create(request, *args, **kwargs)
        raise MethodNotAllowed('You Do Not Belong to Any Department')
