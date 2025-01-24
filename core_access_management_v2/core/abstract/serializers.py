from rest_framework import serializers
from .models import AbstractModel

class AbstractModelSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex', source='PublicId', read_only=True)
    Created = serializers.DateTimeField(read_only=True)
    Updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model:AbstractModel = AbstractModel
        read_only_fields = ['id', 'created', 'updated']