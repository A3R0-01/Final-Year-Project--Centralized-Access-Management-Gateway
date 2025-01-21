from rest_framework import routers
from core.citizen.viewsets import CitizenViewSet
from core.auth.viewsets.register import RegisterViewSet

router  = routers.SimpleRouter()

router.register(r'citizen', CitizenViewSet, basename='citizen')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')

urlPatterns = [
    *router.urls,
]