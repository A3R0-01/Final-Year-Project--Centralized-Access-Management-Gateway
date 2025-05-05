from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.status import HTTP_201_CREATED
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from .serializers import AbstractModelSerializer
from .models import AbstractManager
from .authenticationClasses import IsSiteManager, IsAdministrator, IsGrantee
from pprint import pprint
# Create your views here.

class AbstractModelViewSet(ModelViewSet):
    permission_classes = (IsAuthenticatedOrReadOnly,)
    http_method_names = ['get', 'post', 'patch']
    serializer_class : AbstractModelSerializer = AbstractModelSerializer

    def get_object(self):
        id = self.kwargs['pk']
        try:
            obj = self.get_queryset().get(PublicId=id)
        except (ObjectDoesNotExist, ValidationError, ValueError, TypeError):
            raise NotFound("Record Not Found")
        self.check_object_permissions(self.request, obj)
        return obj

    def get_query_keys(self) -> list:
        query_params = self.request.GET
        query_list = list(query_params.keys())
        return query_list

    def get_model_attributes(self):
        model_fields = self.serializer_class.Meta.model._meta.get_fields()
        attribute_list = [field.name for field in model_fields if field.concrete]
        return attribute_list

    def get_queries(self) -> dict:
        model_attributes = self.get_model_attributes()
        key_words = {}
        for query in self.get_query_keys() :
            for attribute in model_attributes:
                if attribute in query: key_words[query] = self.request.query_params.get(query)
        return key_words
    
    def get_queryset(self):
        queries = self.get_queries()
        return self.serializer_class.Meta.model.objects.filter(**queries)

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
        try:
            obj = self.get_queryset().get(PublicId=id)
        except (ObjectDoesNotExist, ValidationError, ValueError, TypeError):
            raise NotFound("Record Not Found")
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self) -> AbstractManager :
        queries = self.get_queries()
        return self.serializer_class.Meta.model.objects.filter(**queries)

    def create(self, request, *args, **kwargs):
        pprint(request.data)
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

