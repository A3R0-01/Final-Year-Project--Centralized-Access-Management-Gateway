from django.shortcuts import render
from django.db.transaction import atomic
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from core.abstract.viewset import AbstractModelViewSet, AbstractGranteeModelViewSet, AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet
from core.department.models import Department
from core.association.models import Association
from .serializers import CitizenRequestSerializer, GranteeRequestSerializer, AdministratorRequestSerializer, SiteManagerRequestSerializer
from core.serviceSession.serializers import SiteManagerServiceSessionSerializer
from core.abstract.serializers import AbstractModelSerializer
from django.utils import timezone as djTimezone
from django.db.utils import IntegrityError
import ipaddress

# Create your views here.

class CitizenRequestViewSet(AbstractModelViewSet):
    serializer_class = CitizenRequestSerializer
    http_method_names = ('get', 'post', 'patch')

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

    def get_queryset(self):
        queries = self.get_queries()
        queries['Citizen'] = self.request.user
        objects = self.serializer_class.Meta.model.objects.filter(**queries)
        for obj in objects:
            if hasattr(obj, 'grant'):
                if obj.grant.granted:
                    self.createSessions(obj.PublicService)
        return objects

    @atomic
    def create(self, request, *args, **kwargs):
        request.data['Citizen'] = self.request.user.PublicId.hex
        return super().create(request, *args, **kwargs)

class GranteeRequestViewSet(AbstractGranteeModelViewSet):
    serializer_class = GranteeRequestSerializer
    http_method_names = ('get')

    def get_queryset(self):
        if hasattr(self.request.user, 'grantee'):
            queries = self.get_queries()
            queries['PublicService__Grantee'] = self.request.user.grantee
            return self.serializer_class.Meta.model.objects.filter(**queries)
        else:
            raise MethodNotAllowed()

class AdministratorRequestViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorRequestSerializer
    http_method_names = ('get', 'delete')

    def get_queryset(self):
        if hasattr(self.request.user, 'administrator'):
            department = Department.objects.get(Administrator=self.request.user.administrator)
            associations = Association.objects.filter(Department=department)
            queries = self.get_queries()
            queries['PublicService__Association__in'] = associations
            return self.serializer_class.Meta.model.objects.filter(**queries)
        raise MethodNotAllowed()

class SiteManagerRequestViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerRequestSerializer
    http_method_names = ('get')

