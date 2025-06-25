from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from core.abstract.viewset import AbstractSiteManagerModelViewSet
from .serializers import SiteManagerSerializer
from pprint import pprint


# Create your views here.
class SiteManagerModelViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get', 'patch',)
    serializer_class = SiteManagerSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        pprint(self.request.user.sitemanager)
        return self.request.user.sitemanager

    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.all()

    def update(self, request, *args, **kwargs):
        pprint(request.data)
        return super().update(request, *args, **kwargs)

