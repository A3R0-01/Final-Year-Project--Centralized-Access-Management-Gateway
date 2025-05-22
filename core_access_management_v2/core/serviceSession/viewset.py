from django.shortcuts import render
from core.abstract.viewset import AbstractAdministratorModelViewSet, AbstractGranteeModelViewSet, AbstractSiteManagerModelViewSet
from .serializers import SiteManagerServiceSessionSerializer, AdministratorServiceSessionSerializer, GranteeServiceSessionSerializer
from datetime import datetime, timezone
from django.utils import timezone as djTimezone


# Create your views here.
class GranteeServiceSessionViewSet(AbstractGranteeModelViewSet):
    serializer_class = GranteeServiceSessionSerializer
    http_method_names = ('get')


class AdministratorServiceSessionViewSet(AbstractAdministratorModelViewSet):
    serializer_class = AdministratorServiceSessionSerializer
    http_method_names = ('get')

class SiteManagerServiceSessionViewSet(AbstractSiteManagerModelViewSet):
    serializer_class = SiteManagerServiceSessionSerializer
    http_method_names = ('get', 'post', 'patch')

    def update(self, request, *args, **kwargs):
        dt = djTimezone.now()
        formatted = dt.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        if request.data == {}:
            request.data["LastSeen"] =  formatted
        elif hasattr(request.data , "LastSeen"):
            outcome = request.data.pop("LastSeen")
        return super().update(request, *args, **kwargs)