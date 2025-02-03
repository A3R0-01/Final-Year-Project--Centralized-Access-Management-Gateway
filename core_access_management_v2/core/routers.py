from rest_framework import routers
from core.citizen.viewsets import CitizenViewSet, SiteManagerCitizenModelViewSet, AdministratorCitizenModelViewSet, GranteeCitizenModelViewSet
from core.siteManager.viewsets import SiteManagerModelViewSet
from core.administrator.viewsets import SiteManagerAdministratorModelViewSet, AdministratorModelViewSet
from core.grantee.viewset import AdministratorGranteeViewSet, GranteeModelsViewSet, SiteManagerGranteeViewSet
from core.auth.viewsets import RegisterViewSet, LoginCitizenViewSet, RefreshViewSet, LoginSiteManagerViewSet, LoginAdministratorViewSet, LoginGranteeViewSet
from core.department.viewsets import CitizenDepartmentViewSet, GranteeDepartmentViewSet, AdministratorDepartmentViewSet, SiteManagerDepartmentViewSet
from core.association.viewsets import CitizenAssociationModelViewSet, GranteeAssociationModelViewSet, AdministratorAssociationModelViewSet, SiteManagerAssociationModelViewSet


router  = routers.SimpleRouter()
#Citizen
router.register(r'citizen', CitizenViewSet, basename='citizen')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
router.register(r'auth/login', LoginCitizenViewSet, basename='auth-login-citizen')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh-citizen')
router.register(r'department', CitizenDepartmentViewSet, basename='department')
router.register(r'association', CitizenAssociationModelViewSet, basename='association')

# SiteManager
router.register(r'manager/siteManager', SiteManagerModelViewSet, basename='Manager')
router.register(r'manager/login', LoginSiteManagerViewSet, basename='auth-login-manager')
router.register(r'manager/citizen', SiteManagerCitizenModelViewSet, basename='manager-citizen')
router.register(r'manager/administrator', SiteManagerAdministratorModelViewSet, basename='manager-administrator')
router.register(r'manager/grantee', SiteManagerGranteeViewSet, basename='manager-grantee')
router.register(r'manager/department', SiteManagerDepartmentViewSet, basename='manager-department')
router.register(r'manager/association', SiteManagerAssociationModelViewSet, basename='manager-association')



# Administrator
router.register(r'admin/login', LoginAdministratorViewSet, basename='auth-login-admin')
router.register(r'admin/citizen', AdministratorCitizenModelViewSet, basename='admin-citizen')
router.register(r'admin/administrator', AdministratorModelViewSet, basename='admin-administrator')
router.register(r'admin/grantee', AdministratorGranteeViewSet, basename='admin-grantee')
router.register(r'admin/department', AdministratorDepartmentViewSet, basename='admin-department')
router.register(r'admin/association', AdministratorAssociationModelViewSet, basename='admin-association')


# Grantee
router.register(r'grantee/login', LoginGranteeViewSet, basename='auth-login-grantee')
router.register(r'grantee/grantee', GranteeModelsViewSet, basename='grantee-grantee')
router.register(r'grantee/citizen', GranteeCitizenModelViewSet, basename='grantee-citizen')
router.register(r'grantee/department', GranteeDepartmentViewSet, basename='grantee-department')
router.register(r'grantee/association', GranteeAssociationModelViewSet, basename='grantee-association')





urlPatterns = [
    *router.urls,
]