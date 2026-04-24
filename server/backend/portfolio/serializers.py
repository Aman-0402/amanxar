from rest_framework import serializers
from .models import Project, AboutStat, WhatIDo, BioParagraph, AboutHighlight


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


class AboutStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutStat
        fields = ['id', 'icon_name', 'value', 'label', 'order']
        read_only_fields = ['id']


class WhatIDoSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatIDo
        fields = ['id', 'icon_name', 'title', 'description', 'tags', 'order']
        read_only_fields = ['id']


class BioParagraphSerializer(serializers.ModelSerializer):
    class Meta:
        model = BioParagraph
        fields = ['id', 'text', 'order']
        read_only_fields = ['id']


class AboutHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutHighlight
        fields = ['id', 'text', 'order']
        read_only_fields = ['id']
