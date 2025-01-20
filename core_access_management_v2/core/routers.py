from rest_framework import routers
from core.citizen.viewsets import CitizenViewSet

router  = routers.SimpleRouter()

router.register(r'citizen', CitizenViewSet, basename='citizen')

urlPatterns = [
    *router.urls,
]