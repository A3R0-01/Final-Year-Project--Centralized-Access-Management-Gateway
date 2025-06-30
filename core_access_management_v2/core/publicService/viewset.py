from django.shortcuts import render
from django.db.transaction import atomic
from django.core.exceptions import ObjectDoesNotExist, ValidationError as ValidationError_Django
from rest_framework.exceptions import ValidationError, MethodNotAllowed, NotFound
from core.association.models import Association
from core.abstract.viewset import AbstractModelViewSet, AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from core.association.serializers import AdministratorAssociationModelSerializer, SiteManagerAssociationModelSerializer
from core.association.models import Association
from core.grantee.serializers import AdministratorGranteeSerializer, SiteManagerGranteeSerializer
from core.servicePermissions.models import AssociationPermission, DepartmentPermission, PublicServicePermission
from core.serviceSession.serializers import SiteManagerServiceSessionSerializer
from core.abstract.serializers import AbstractModelSerializer
from core.request.models import Request
from .serializers import CitizenPublicServiceSerializer, GranteePublicServiceSerializer, AdministratorPublicServiceSerializer, SiteManagerPublicServiceSerializer
from django.utils import timezone as djTimezone
from django.db.utils import IntegrityError
import ipaddress

# Create your views here.
class CitizenPublicServiceViewSet(AbstractModelViewSet):
    http_method_names : tuple[str] = ('get',)
    serializer_class = CitizenPublicServiceSerializer

    def get_object(self):
        id = self.kwargs['pk']
        obj = None
        for func in [self.getQ_PublicService_UnRestricted, self.getQ_PublicService_Granted, self.getQ_PublicService_Association, self.getQ_PublicService_Department, self.getQ_PublicService_Service]:
            try:
                obj = func().get(PublicId=id)
                if obj:break
            except (ObjectDoesNotExist, ValidationError_Django, ValueError, TypeError):
                continue
        if obj:
            self.check_object_permissions(self.request, obj)
            return obj
        raise NotFound("Service Not Found")
    
    def createSessions(self, obj):
        try:
            raw_ip = self.get_client_ip()
            client_ip = self.normalize_ip(raw_ip)
            dt = djTimezone.now()
            formatted = dt.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
            data = {
                "Citizen": self.request.user.PublicId.hex,
                "Service": obj.PublicId.hex,
                "IpAddress": client_ip,
                "LastSeen": formatted,
            }        
            serializer : AbstractModelSerializer = SiteManagerServiceSessionSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer=serializer)
            print('created session')
        except(IntegrityError):
            raise ValidationError('Invalid Data: make sure that all referenced data follows the guidelines')

        

    def getQ_PublicService_Service(self):
        publicServicePermissions = PublicServicePermission.objects.filter(Citizens=self.request.user)
        publicServices = []
        for permission in publicServicePermissions:
            publicServices.append(permission.PublicId.hex)
        queries = self.get_queries()
        queries["PublicId__in"] = publicServices
        objects = self.serializer_class.Meta.model.objects.filter(**queries)
        return objects

    def getQ_PublicService_Association(self):
        associationPermission = AssociationPermission.objects.filter(Citizens=self.request.user)
        associations = []
        for permission in associationPermission:
            associations.append(permission.Association)
        queries = self.get_queries()
        queries["Association__in"] = associations
        objects = self.serializer_class.Meta.model.objects.filter(**queries)
        return objects

    def getQ_PublicService_Department(self):
        departmentPermissions = DepartmentPermission.objects.filter(Citizens=self.request.user)
        departments = []
        for permission in departmentPermissions:
            departments.append(permission.Department)
        associations = Association.objects.filter(Department__in=departments)
        queries = self.get_queries()
        queries["Association__in"] = associations
        objects = self.serializer_class.Meta.model.objects.filter(**queries)
        return objects
    
    def getQ_PublicService_UnRestricted(self):
        queries = self.get_queries()
        queries['Restricted'] = False
        queries['Visibility'] = True
        objects = self.serializer_class.Meta.model.objects.filter(**queries)
        return objects

    def getQ_PublicService_Restricted(self):
        queries = self.get_queries()
        queries['Restricted'] = True
        queries['Visibility'] = True
        return self.serializer_class.Meta.model.objects.filter(**queries)
    
    def getQ_PublicService_Granted(self):
        requests = Request.objects.filter(Citizen__PublicId=self.request.user.PublicId.hex)
        services = []
        for req in requests:
            if hasattr(req, 'grant'):
                if req.grant.granted:
                    services.append(req.PublicService.PublicId)
        queries = self.get_queries()
        queries['PublicId__in'] = services
        return self.serializer_class.Meta.model.objects.filter(**queries)

    def get_queryset(self):
        by_association_permission = self.getQ_PublicService_Association()
        by_department_permission = self.getQ_PublicService_Department()
        by_service_permission = self.getQ_PublicService_Service()
        by_publicity = self.getQ_PublicService_UnRestricted()
        by_grant = self.getQ_PublicService_Granted()
        objects =  by_publicity.union(by_department_permission).union(by_association_permission).union(by_service_permission).union(by_grant)
        for obj in objects:
            self.createSessions(obj)
        by_restriction = self.getQ_PublicService_Restricted()
        return objects.union(by_restriction)
    
    def normalize_ip(self, ip_str):
        try:
            ip = ipaddress.ip_address(ip_str)
            # Convert IPv6 loopback (::1) to IPv4 loopback
            if ip.is_loopback and ip.version == 6:
                return "127.0.0.1"

            # Convert IPv6-mapped IPv4 (::ffff:x.x.x.x) to x.x.x.x
            if ip.version == 6 and ip.ipv4_mapped:
                return str(ip.ipv4_mapped)

            # Return the normalized IP string (IPv4 or IPv6)
            return str(ip)
        except ValueError:
            # Invalid IP, return as-is
            return ip_str

    def get_client_ip(self):
        # Check for X-Forwarded-For header first (standard for proxies)
        ip = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if ip:
            # X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
            # The first one is the original client IP
            ips = [x.strip() for x in ip.split(',')]
            if ips:
                return ips[0]

        # Try other common headers
        ip = self.request.META.get('HTTP_X_REAL_IP')
        if ip:
            return ip

        # Try X-Client-IP (used by some CDNs and proxies)
        ip = self.request.META.get('HTTP_X_CLIENT_IP')
        if ip:
            return ip

        # Use REMOTE_ADDR as fallback
        remote_addr = self.request.META.get('REMOTE_ADDR')
        if remote_addr:
            # REMOTE_ADDR includes port, so we need to strip it
            # The format is usually 'IP_ADDRESS:PORT'
            if ':' in remote_addr:
                try:
                    host, port = remote_addr.rsplit(':', 1)
                    # Check if it's an IPv6 address that includes colons
                    if '[' in host and ']' in host: # IPv6 literal
                        return host.strip('[]')
                    else: # IPv4 or simple hostname
                        return host
                except ValueError:
                    # Fallback if splitting fails for some reason
                    return remote_addr
            return remote_addr

        return "unknown"


class GranteePublicServiceViewSet(AbstractGranteeModelViewSet):
    http_method_names : tuple[str] = ('get',)
    serializer_class = GranteePublicServiceSerializer

    def get_queryset(self):
        queries = self.get_queries()
        queries['Grantee'] = self.request.user.grantee
        return self.serializer_class.Meta.model.objects.filter(**queries)

class AdministratorPublicServiceViewSet(AbstractAdministratorModelViewSet):
    http_method_names : tuple[str] = ('get', 'patch', 'post', 'delete')
    serializer_class = AdministratorPublicServiceSerializer

    def get_queryset(self):
        if hasattr(self.request.user.administrator, 'department'):
            department = self.request.user.administrator.department
            associations = Association.objects.filter(Department=department)
            queries = self.get_queries()
            queries['Association__in'] = associations
            return self.serializer_class.Meta.model.objects.filter(**queries)
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

