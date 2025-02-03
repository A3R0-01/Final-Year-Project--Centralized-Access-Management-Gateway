from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.status import HTTP_201_CREATED
from rest_framework.response import Response
from .serializers import AbstractModelSerializer
from .authenticationClasses import IsSiteManager, IsAdministrator, IsGrantee
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

    def secondary_create(self, serializer_class: AbstractModelSerializer, data : dict[str], *args, **kwargs) -> str:
        serializer : AbstractModelSerializer = serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return serializer.data['id']

    def create(self, request, *args, **kwargs):
        serializer : AbstractModelSerializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer=serializer)
        return Response(serializer.data, HTTP_201_CREATED)
    

class AbstractGranteeModelViewSet(AbstractModelViewSet):
    http_method_names = ('patch', 'get', 'post')
    permission_classes = (IsAuthenticated,)
    def get_authenticators(self):
        customAuthenticators = [IsGrantee()]
        return customAuthenticators

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

class AbstractAdministratorModelViewSet(AbstractGranteeModelViewSet):
    def get_authenticators(self):
        customAuthenticators = [IsAdministrator()]
        return customAuthenticators

class AbstractSiteManagerModelViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('patch', 'get', 'post', 'delete')
    permission_classes = (IsAuthenticated,)

    def get_authenticators(self):
        customAuthenticators = [IsSiteManager()]
        return customAuthenticators

