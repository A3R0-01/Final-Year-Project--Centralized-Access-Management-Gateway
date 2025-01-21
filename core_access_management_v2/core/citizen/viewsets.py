from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from .serializers import CitizenSerializer
from .models import Citizen
# Create your views here.

class CitizenViewSet(ModelViewSet):
    serializer_class = CitizenSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ('get', 'patch')

    def get_queryset(self):
        return Citizen.objects.all()

    def get_object(self):
        id = self.kwargs['pk']
        citizen = Citizen.objects.get_by_id(id)
        self.check_object_permissions(self.request, citizen)
        return citizen

