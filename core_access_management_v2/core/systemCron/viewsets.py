from django.shortcuts import render
from core.abstract.viewset import AbstractSiteManagerModelViewSet
from .serializers import SystemCronSerializer

# Create your views here.
class SystemCronViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get')
    serializer_class = SystemCronSerializer
