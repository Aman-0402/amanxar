from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id',
            'slug',
            'title',
            'shortDesc',
            'longDesc',
            'thumbnail',
            'images',
            'techStack',
            'categories',
            'featured',
            'status',
            'links',
            'year',
            'duration',
            'highlights',
        ]
        read_only_fields = ['id']
