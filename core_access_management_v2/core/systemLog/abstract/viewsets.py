from core.abstract.viewset import AbstractAdministratorModelViewSet, AbstractSiteManagerModelViewSet

class AbstractAdministratorLogViewset(AbstractAdministratorModelViewSet):
    http_method_names = ('get')

class AbstractSiteManagerLogViewset(AbstractSiteManagerModelViewSet):
    http_method_names = ('get')