from django.shortcuts import render
from django.db.transaction import atomic
from rest_framework.exceptions import ValidationError, MethodNotAllowed
from core.association.models import Association
from core.abstract.viewset import AbstractModelViewSet, AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from core.association.serializers import AdministratorAssociationModelSerializer, SiteManagerAssociationModelSerializer
from core.association.models import Association
from core.grantee.serializers import AdministratorGranteeSerializer, SiteManagerGranteeSerializer
from core.servicePermissions.models import AssociationPermission, DepartmentPermission, PublicServicePermission
from .serializers import CitizenPublicServiceSerializer, GranteePublicServiceSerializer, AdministratorPublicServiceSerializer, SiteManagerPublicServiceSerializer
# Create your views here.
class CitizenPublicServiceViewSet(AbstractModelViewSet):
    http_method_names : tuple[str] = ('get',)
    serializer_class = CitizenPublicServiceSerializer

    def getQ_PublicService_Service(self):
        publicServicePermissions = PublicServicePermission.objects.filter(Citizens=self.request.user)
        publicServices = []
        for permission in publicServicePermissions:
            publicServices.append(permission.PublicId.hex)
        return self.serializer_class.Meta.model.objects.filter(PublicId__in=publicServices)

    def getQ_PublicService_Association(self):
        associationPermission = AssociationPermission.objects.filter(Citizens=self.request.user)
        associations = []
        for permission in associationPermission:
            associations.append(permission.Association)
        return self.serializer_class.Meta.model.objects.filter(Association__in=associations)

    def getQ_PublicService_Department(self):
        departmentPermissions = DepartmentPermission.objects.filter(Citizens=self.request.user)
        departments = []
        for permission in departmentPermissions:
            departments.append(permission.Department)
        associations = Association.objects.filter(Department__in=departments)
        return self.serializer_class.Meta.model.objects.filter(Association__in=associations)
    
    def getQ_PublicService_Restricted(self):
        return self.serializer_class.Meta.model.objects.filter(Restricted=False)

    def get_queryset(self):
        by_association_permission = self.getQ_PublicService_Association()
        by_department_permission = self.getQ_PublicService_Department()
        by_service_permission = self.getQ_PublicService_Service()
        by_publicity = self.getQ_PublicService_Restricted()
        return by_publicity.union(by_department_permission).union(by_association_permission).union(by_service_permission)


class GranteePublicServiceViewSet(AbstractGranteeModelViewSet):
    http_method_names : tuple[str] = ('get',)
    serializer_class = GranteePublicServiceSerializer

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.filter(Grantee=self.request.user.grantee)

class AdministratorPublicServiceViewSet(AbstractAdministratorModelViewSet):
    http_method_names : tuple[str] = ('get', 'patch', 'post', 'delete')
    serializer_class = AdministratorPublicServiceSerializer

    def get_queryset(self):
        if hasattr(self.request.user.administrator, 'department'):
            department = self.request.user.administrator.department
            associations = Association.objects.filter(Department=department)
            return self.serializer_class.Meta.model.objects.filter(Association__in=associations)
        raise MethodNotAllowed('GET')
    @atomic
    def create(self, request, *args, **kwargs):
        association = request.data.pop('Association', False)
        grantee = request.data.pop('Grantee', False)
        if not association:
            raise ValidationError("Association missing")
        elif type(association) == dict:
            association = self.secondary_create(AdministratorAssociationModelSerializer, association)
        if not grantee:
            raise ValidationError("Grantee is missing")
        elif type(grantee) == dict:
            grantee = self.secondary_create(AdministratorGranteeSerializer, grantee)
        request.data['Association'] = association
        request.data['Grantee'] = grantee
        return super().create(request, *args, **kwargs)

class SiteManagerPublicServiceViewSet(AbstractSiteManagerModelViewSet):
    http_method_names : tuple[str] = ('get', 'patch', 'post', 'delete')
    serializer_class = SiteManagerPublicServiceSerializer
    @atomic
    def create(self, request, *args, **kwargs):
        association = request.data.pop('Association', False)
        grantee = request.data.pop('Grantee', False)
        if not association:
            raise ValidationError("Association is missing")
        elif type(association) == dict:
            association = self.secondary_create(SiteManagerAssociationModelSerializer, association)
        if not grantee:
            raise ValidationError("Grantee is missing")
        elif type(grantee) == dict:
            grantee = self.secondary_create(SiteManagerGranteeSerializer, grantee)
        request.data['Association'] = association
        request.data['Grantee'] = grantee
        return super().create(request, *args, **kwargs)

