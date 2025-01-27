from rest_framework import routers
from core.citizen.viewsets import CitizenViewSet
from core.siteManager.viewsets import SiteManagerModelViewSet
from core.auth.viewsets import RegisterViewSet, LoginCitizenViewSet, RefreshViewSet, LoginSiteManagerViewSet


router  = routers.SimpleRouter()

router.register(r'citizen', CitizenViewSet, basename='citizen')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
router.register(r'auth/login', LoginCitizenViewSet, basename='auth-login-citizen')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh-citizen')

# SiteManager
router.register(r'admin/siteManager', SiteManagerModelViewSet, basename='siteManager')
router.register(r'admin/login', LoginSiteManagerViewSet, basename='auth-login-sitemanager')

urlPatterns = [
    *router.urls,
]