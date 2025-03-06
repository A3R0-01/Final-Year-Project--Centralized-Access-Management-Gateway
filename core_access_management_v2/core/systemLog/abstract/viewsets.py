from core.abstract.viewset import AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet, AbstractGranteeModelViewSet

class AdministratorLogViewSet(AbstractAdministratorModelViewSet):
    http_method_names = ('get')

class SiteManagerLogViewSet(AbstractSiteManagerModelViewSet):
    http_method_names = ('get')

class GranteeLogViewSet(AbstractGranteeModelViewSet):
    http_method_names = ('get')
