from django.shortcuts import render
from core.abstract_circular.viewsets import AdministratorLogViewSet, SiteManagerLogViewSet, GranteeLogViewSet
from .serializers import CitizenLogSerializer, GranteeLogSerializer, AdministratorLogSerializer, SiteManagerLogSerializer
# Create your views here.
class GranteeCitizenLogViewSet(GranteeLogViewSet):
    serializer_class = CitizenLogSerializer

class AdministratorCitizenLogViewSet(AdministratorLogViewSet):
    serializer_class = CitizenLogSerializer

class AdministratorGranteeLogViewSet(AdministratorLogViewSet):
    serializer_class = GranteeLogSerializer

class SiteManagerCitizenLogViewSet(SiteManagerLogViewSet):
    serializer_class = CitizenLogSerializer

class SiteManagerGranteeLogViewSet(SiteManagerLogViewSet):
    serializer_class = GranteeLogSerializer

class SiteManagerAdministratorLogViewSet(SiteManagerLogViewSet):
    serializer_class = AdministratorLogSerializer

class SiteManagerManagerLogViewSet(SiteManagerLogViewSet):
    serializer_class = SiteManagerLogSerializer



