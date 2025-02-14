from django.shortcuts import render
from core.abstract.viewset import AbstractModelViewSet
from .serializers import CitizenRequestSerializer
# Create your views here.

class CitizenRequestViewSet(AbstractModelViewSet):
    serializer_class = CitizenRequestSerializer
    http_method_names = ('get', 'post', 'patch', 'delete')
