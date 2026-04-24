from rest_framework import serializers
from .models import (
    Project,
    AboutStat,
    WhatIDo,
    BioParagraph,
    AboutHighlight,
    SkillCategory,
    TechStackCategory,
    TimelineItem,
    Message,
    EBook,
    KnowledgeHubCategory,
    KnowledgeTool,
    GalleryItem,
    Service,
    NavbarLink,
    FooterSection,
    FooterLink,
    FooterCTA,
    SocialLink,
)


class ProjectSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=False, allow_null=True)

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


class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ['id', 'category', 'icon', 'color', 'skills', 'order']
        read_only_fields = ['id']


class TechStackCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TechStackCategory
        fields = ['id', 'category', 'techs', 'order']
        read_only_fields = ['id']


class TimelineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineItem
        fields = ['id', 'year', 'title', 'type', 'description', 'tags', 'order']
        read_only_fields = ['id']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'read']
        read_only_fields = ['id', 'created_at']


class EBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = EBook
        fields = ['id', 'slug', 'title', 'subtitle', 'description', 'category', 'tags',
                  'gradient', 'icon', 'icon_white', 'read_url', 'is_free', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class KnowledgeToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeTool
        fields = ['id', 'name', 'description', 'url', 'emoji', 'category', 'tags', 'pricing', 'rating', 'featured', 'added_at', 'order']
        read_only_fields = ['id', 'added_at']


class KnowledgeHubCategorySerializer(serializers.ModelSerializer):
    tools = KnowledgeToolSerializer(many=True, read_only=True)

    class Meta:
        model = KnowledgeHubCategory
        fields = ['id', 'label', 'description', 'icon_name', 'color', 'order', 'tools']
        read_only_fields = ['id']


class GalleryItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=True)

    class Meta:
        model = GalleryItem
        fields = ['id', 'title', 'description', 'category', 'image', 'year', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'slug', 'title', 'icon', 'description', 'features', 'pricing', 'cta', 'cta_link', 'order']
        read_only_fields = ['id']


class NavbarLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavbarLink
        fields = ['id', 'label', 'href', 'order']
        read_only_fields = ['id']


class FooterLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterLink
        fields = ['id', 'section', 'label', 'href', 'external', 'order']
        read_only_fields = ['id']


class FooterSectionSerializer(serializers.ModelSerializer):
    links = FooterLinkSerializer(many=True, read_only=True)

    class Meta:
        model = FooterSection
        fields = ['id', 'title', 'order', 'links']
        read_only_fields = ['id']


class FooterCTASerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterCTA
        fields = ['id', 'badge_text', 'heading', 'button_text', 'button_url']
        read_only_fields = ['id']


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'icon_name', 'order']
        read_only_fields = ['id']
