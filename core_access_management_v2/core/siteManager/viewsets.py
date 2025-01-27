from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from core.abstract.viewset import AbstractSiteManagerModelViewSet
from .serializers import SiteManagerSerializer



# Create your views here.
class SiteManagerModelViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'patch',)
    serializer_class = SiteManagerSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user.siteManager

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.all()
