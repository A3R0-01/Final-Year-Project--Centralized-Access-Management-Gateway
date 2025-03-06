from rest_framework import routers
from core.citizen.viewsets import CitizenViewSet, SiteManagerCitizenModelViewSet, AdministratorCitizenModelViewSet, GranteeCitizenModelViewSet
from core.siteManager.viewsets import SiteManagerModelViewSet
from core.administrator.viewsets import SiteManagerAdministratorModelViewSet, AdministratorModelViewSet
from core.grantee.viewset import AdministratorGranteeViewSet, GranteeModelsViewSet, SiteManagerGranteeViewSet
from core.auth.viewsets import RegisterViewSet, LoginCitizenViewSet, RefreshViewSet, LoginSiteManagerViewSet, LoginAdministratorViewSet, LoginGranteeViewSet
from core.department.viewsets import CitizenDepartmentViewSet, GranteeDepartmentViewSet, AdministratorDepartmentViewSet, SiteManagerDepartmentViewSet
from core.association.viewsets import CitizenAssociationModelViewSet, GranteeAssociationModelViewSet, AdministratorAssociationModelViewSet, SiteManagerAssociationModelViewSet
from core.publicService.viewset import CitizenPublicServiceViewSet, GranteePublicServiceViewSet, AdministratorPublicServiceViewSet, SiteManagerPublicServiceViewSet
from core.request.viewsets import CitizenRequestViewSet, GranteeRequestViewSet, AdministratorRequestViewSet, SiteManagerRequestViewSet
from core.grant.viewsets import CitizenGrantViewSet, GranteeGrantViewSet, AdministratorGrantViewSet, SiteManagerGrantViewSet
from core.systemLog.viewsets import GranteeCitizenLogViewSet, AdministratorCitizenLogViewSet, AdministratorGranteeLogViewSet, SiteManagerCitizenLogViewSet, SiteManagerGranteeLogViewSet, SiteManagerAdministratorLogViewSet, SiteManagerManagerLogViewSet

router  = routers.SimpleRouter()



#Citizen
router.register(r'citizen', CitizenViewSet, basename='citizen')
router.register(r'auth/register', RegisterViewSet, basename='auth-register')
router.register(r'auth/login', LoginCitizenViewSet, basename='auth-login-citizen')
router.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh-citizen')
router.register(r'department', CitizenDepartmentViewSet, basename='department')
router.register(r'association', CitizenAssociationModelViewSet, basename='association')
router.register(r'service', CitizenPublicServiceViewSet, basename='service')
router.register(r'request', CitizenRequestViewSet, basename='request')
router.register(r'grant', CitizenGrantViewSet, basename='grant')



# SiteManager
router.register(r'manager/siteManager', SiteManagerModelViewSet, basename='Manager')
router.register(r'manager/login', LoginSiteManagerViewSet, basename='auth-login-manager')
router.register(r'manager/citizen', SiteManagerCitizenModelViewSet, basename='manager-citizen')
router.register(r'manager/administrator', SiteManagerAdministratorModelViewSet, basename='manager-administrator')
router.register(r'manager/grantee', SiteManagerGranteeViewSet, basename='manager-grantee')
router.register(r'manager/department', SiteManagerDepartmentViewSet, basename='manager-department')
router.register(r'manager/association', SiteManagerAssociationModelViewSet, basename='manager-association')
router.register(r'manager/service', SiteManagerPublicServiceViewSet, basename='manager-service')
router.register(r'manager/request', SiteManagerRequestViewSet, basename='manager-request')
router.register(r'manager/grant', SiteManagerGrantViewSet, basename='manager-grant')
router.register(r'manager/log/citizen', SiteManagerCitizenLogViewSet, basename='manager-log-citizen')
router.register(r'manager/log/grantee', SiteManagerGranteeLogViewSet, basename='manager-log-grantee')
router.register(r'manager/log/administrator', SiteManagerAdministratorLogViewSet, basename='manager-log-administrator')
router.register(r'manager/log/manager', SiteManagerManagerLogViewSet, basename='manager-log-manager')



# Administrator
router.register(r'admin/login', LoginAdministratorViewSet, basename='auth-login-admin')
router.register(r'admin/citizen', AdministratorCitizenModelViewSet, basename='admin-citizen')
router.register(r'admin/administrator', AdministratorModelViewSet, basename='admin-administrator')
router.register(r'admin/grantee', AdministratorGranteeViewSet, basename='admin-grantee')
router.register(r'admin/department', AdministratorDepartmentViewSet, basename='admin-department')
router.register(r'admin/association', AdministratorAssociationModelViewSet, basename='admin-association')
router.register(r'admin/service', AdministratorPublicServiceViewSet, basename='admin-service')
router.register(r'admin/request', AdministratorRequestViewSet, basename='admin-request')
router.register(r'admin/grant', AdministratorGrantViewSet, basename='admin-grant')
router.register(r'admin/log/citizen', AdministratorCitizenLogViewSet, basename='admin-log-citizen')
router.register(r'admin/log/grantee', AdministratorGranteeLogViewSet, basename='admin-log-grantee')



# Grantee
router.register(r'grantee/login', LoginGranteeViewSet, basename='auth-login-grantee')
router.register(r'grantee/grantee', GranteeModelsViewSet, basename='grantee-grantee')
router.register(r'grantee/citizen', GranteeCitizenModelViewSet, basename='grantee-citizen')
router.register(r'grantee/department', GranteeDepartmentViewSet, basename='grantee-department')
router.register(r'grantee/association', GranteeAssociationModelViewSet, basename='grantee-association')
router.register(r'grantee/service', GranteePublicServiceViewSet, basename='grantee-service')
router.register(r'grantee/request', GranteeRequestViewSet, basename='grantee-request')
router.register(r'grantee/grant', GranteeGrantViewSet, basename='grantee-grant')
router.register(r'grantee/log', GranteeCitizenLogViewSet, basename='grantee-log')



urlPatterns = [
    *router.urls,
]