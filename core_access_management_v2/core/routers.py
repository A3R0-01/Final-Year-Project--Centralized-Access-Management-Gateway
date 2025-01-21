from rest_framework import routers
from core.citizen.viewsets import CitizenViewSet
from core.auth.viewsets import RegisterViewSet, LoginViewSet, RefreshViewSet


router  = routers.SimpleRouter()

router.register(r'citizen', CitizenViewSet, basename='citizen')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
router.register(r'auth/login', LoginViewSet, basename='auth-login')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')

urlPatterns = [
    *router.urls,
]