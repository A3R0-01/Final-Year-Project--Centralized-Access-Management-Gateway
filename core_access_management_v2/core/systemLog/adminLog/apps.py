from django.apps import AppConfig


class AdminlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.systemLog.adminLog'
    label = 'adminLog'