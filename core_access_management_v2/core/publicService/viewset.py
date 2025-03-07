from django.shortcuts import render
from django.db.transaction import atomic
from rest_framework.exceptions import ValidationError, MethodNotAllowed
from core.association.models import Association
from core.abstract.viewset import AbstractModelViewSet, AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from core.association.serializers import AdministratorAssociationModelSerializer, SiteManagerAssociationModelSerializer
from core.grantee.serializers import AdministratorGranteeSerializer, SiteManagerGranteeSerializer
from .serializers import CitizenPublicServiceSerializer, GranteePublicServiceSerializer, AdministratorPublicServiceSerializer, SiteManagerPublicServiceSerializer
# Create your views here.
class CitizenPublicServiceViewSet(AbstractModelViewSet):
    http_method_names : tuple[str] = ('get',)
    serializer_class = CitizenPublicServiceSerializer

    def get_queryset(self):
        return super().get_queryset()

class GranteePublicServiceViewSet(AbstractGranteeModelViewSet):
    http_method_names : tuple[str] = ('get',)
    serializer_class = GranteePublicServiceSerializer

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.filter(Association=self.request.user.grantee.Association)

class AdministratorPublicServiceViewSet(AbstractAdministratorModelViewSet):
    http_method_names : tuple[str] = ('get', 'patch', 'post', 'delete')
    serializer_class = AdministratorPublicServiceSerializer

    def get_queryset(self):
        if hasattr(self.request.user.admin, 'department'):
            department = self.request.user.administrator.department
            associations = Association.objects.filter(Department=department)
            return self.serializer_class.Meta.model.objects.filter(Association__in=associations)
        raise MethodNotAllowed('This Information is forbidden')
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

