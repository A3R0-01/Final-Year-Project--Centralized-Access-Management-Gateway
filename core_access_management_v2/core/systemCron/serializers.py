from core.abstract.serializers import AbstractModelSerializer
from .models import SystemCron
class SystemCronSerializer(AbstractModelSerializer):

    class Meta:
        model : SystemCron = SystemCron
        fields : list[str] = [
            'id', 'CronName', 'Message', 'Created', 'FinishedAt', 'Success', 'Failure', 'Updated'
        ]
        read_only_fields : list[str] = [
            'id', 'CronName', 'Message', 'Created', 'FinishedAt', 'Success', 'Failure', 'Updated'
        ]