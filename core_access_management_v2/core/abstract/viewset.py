from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.status import HTTP_201_CREATED
from rest_framework.response import Response
from .serializers import AbstractModelSerializer
from .authenticationClasses import IsSiteManager
# Create your views here.

class AbstractModelViewSet(ModelViewSet):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    http_method_names = ['get', 'post', 'patch']
    serializer_class : AbstractModelSerializer = AbstractModelSerializer

    def get_object(self):
        id = self.kwargs['pk']
        obj = self.serializer_class.Meta.model.objects.get_by_id(id)
        self.check_object_permissions(self.request, obj)
        return obj
    
    def get_queryset(self):
        return self.serializer_class.Meta.model.objects.all()
    
    def create(self, request, *args, **kwargs):
        serializer : AbstractModelSerializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer=serializer)
        return Response(serializer.data, HTTP_201_CREATED)
    
class AbstractSiteManagerModelViewSet(AbstractModelViewSet):
    def get_authenticators(self):
        customAuthenticators = [IsSiteManager()]
        return customAuthenticators

    http_method_names = ['get', 'post', 'patch']
    serializer_class = AbstractModelSerializer



