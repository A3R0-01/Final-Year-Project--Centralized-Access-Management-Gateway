from rest_framework import routers
from core.citizen.viewsets import CitizenViewSet, SiteManagerCitizenModelViewSet
from core.siteManager.viewsets import SiteManagerModelViewSet
from core.administrator.viewsets import SiteManagerAdministratorModelViewSet, AdministratorModelViewSet
from core.grantee.viewset import AdministratorGranteeViewSet, GranteeModelsViewSet
from core.auth.viewsets import RegisterViewSet, LoginCitizenViewSet, RefreshViewSet, LoginSiteManagerViewSet, LoginAdministratorViewSet, LoginGranteeViewSet


router  = routers.SimpleRouter()

router.register(r'citizen', CitizenViewSet, basename='citizen')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
router.register(r'auth/login', LoginCitizenViewSet, basename='auth-login-citizen')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh-citizen')

# SiteManager
router.register(r'manager/siteManager', SiteManagerModelViewSet, basename='Manager')
router.register(r'manager/login', LoginSiteManagerViewSet, basename='auth-login-manager')
router.register(r'manager/citizen', SiteManagerCitizenModelViewSet, basename='manager-citizen')
router.register(r'manager/administrator', SiteManagerAdministratorModelViewSet, basename='manager-administrator')
router.register(r'manager/grantee', AdministratorGranteeViewSet, basename='manager-grantee')


# Administrator
router.register(r'admin/login', LoginAdministratorViewSet, basename='auth-login-admin')
router.register(r'admin/citizen', SiteManagerCitizenModelViewSet, basename='admin-citizen')
router.register(r'admin/administrator', AdministratorModelViewSet, basename='admin-administrator')
router.register(r'admin/grantee', AdministratorGranteeViewSet, basename='admin-grantee')

# Grantee
router.register(r'grantee/login', LoginGranteeViewSet, basename='auth-login-grantee')
router.register(r'grantee/grantee', GranteeModelsViewSet, basename='grantee-grantee')
router.register(r'grantee/citizen', SiteManagerCitizenModelViewSet, basename='grantee-citizen')



urlPatterns = [
    *router.urls,
]