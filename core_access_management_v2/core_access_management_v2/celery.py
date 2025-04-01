import os

from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_access_management_v2.settings')

app = Celery('core_access_management_v2')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.update(
    CELERY_BROKER_URL='kafka://localhost:9092',  # Kafka server
    CELERY_ACCEPT_CONTENT=['json'],
    CELERY_TASK_SERIALIZER='json',
)

# If you're using Kafka and you need to configure additional options like partitions or brokers:
app.conf.update(
    CELERY_KAFKA_PRODUCER_OPTIONS={
        'acks': 'all',  # For producer acknowledgment
        'acks': 1,  # or any other options based on your needs
    }
)
# Load task modules from all registered Django apps.
app.autodiscover_tasks()



@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')