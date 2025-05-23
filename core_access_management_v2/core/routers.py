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
from core.serviceSession.viewset import SiteManagerServiceSessionViewSet, AdministratorServiceSessionViewSet, GranteeServiceSessionViewSet
from core.servicePermissions.viewsets import (
    SiteManagerAssociationPermissionViewSet, SiteManagerPublicServicePermissionViewSet, SiteManagerDepartmentPermissionViewSet,
    AdministratorAssociationPermissionViewSet, AdministratorPublicServicePermissionViewSet, AdministratorDepartmentPermissionViewSet,
    GranteePublicServicePermissionViewSet
)

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
router.register(r'manager/manager', SiteManagerModelViewSet, basename='Manager')
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
router.register(r'manager/permission/department', SiteManagerDepartmentPermissionViewSet, basename='manager-permission-department')
router.register(r'manager/permission/association', SiteManagerAssociationPermissionViewSet, basename='manager-permission-association')
router.register(r'manager/permission/service', SiteManagerPublicServicePermissionViewSet, basename='manager-permission-service')
router.register(r'manager/session', SiteManagerServiceSessionViewSet, basename='manager-session')


# Administrator
router.register(r'admin/login', LoginAdministratorViewSet, basename='auth-login-admin')
router.register(r'admin/citizen', AdministratorCitizenModelViewSet, basename='admin-citizen')
router.register(r'admin/admin', AdministratorModelViewSet, basename='admin-administrator')
router.register(r'admin/grantee', AdministratorGranteeViewSet, basename='admin-grantee')
router.register(r'admin/department', AdministratorDepartmentViewSet, basename='admin-department')
router.register(r'admin/association', AdministratorAssociationModelViewSet, basename='admin-association')
router.register(r'admin/service', AdministratorPublicServiceViewSet, basename='admin-service')
router.register(r'admin/request', AdministratorRequestViewSet, basename='admin-request')
router.register(r'admin/grant', AdministratorGrantViewSet, basename='admin-grant')
router.register(r'admin/log/citizen', AdministratorCitizenLogViewSet, basename='admin-log-citizen')
router.register(r'admin/log/grantee', AdministratorGranteeLogViewSet, basename='admin-log-grantee')
router.register(r'admin/permission/department', AdministratorDepartmentPermissionViewSet, basename='admin-permission-department')
router.register(r'admin/permission/association', AdministratorAssociationPermissionViewSet, basename='admin-permission-association')
router.register(r'admin/permission/service', AdministratorPublicServicePermissionViewSet, basename='admin-permission-service')
router.register(r'admin/session', AdministratorServiceSessionViewSet, basename='admin-session')



# Grantee
router.register(r'grantee/login', LoginGranteeViewSet, basename='auth-login-grantee')
router.register(r'grantee/grantee', GranteeModelsViewSet, basename='grantee-grantee')
router.register(r'grantee/citizen', GranteeCitizenModelViewSet, basename='grantee-citizen')
router.register(r'grantee/department', GranteeDepartmentViewSet, basename='grantee-department')
router.register(r'grantee/association', GranteeAssociationModelViewSet, basename='grantee-association')
router.register(r'grantee/service', GranteePublicServiceViewSet, basename='grantee-service')
router.register(r'grantee/permission/service', GranteePublicServicePermissionViewSet, basename='grantee-permission-service')
router.register(r'grantee/request', GranteeRequestViewSet, basename='grantee-request')
router.register(r'grantee/grant', GranteeGrantViewSet, basename='grantee-grant')
router.register(r'grantee/session', GranteeServiceSessionViewSet, basename='grantee-session')
# router.register(r'grantee/log', GranteeCitizenLogViewSet, basename='grantee-log')



urlPatterns = [
    *router.urls,
]