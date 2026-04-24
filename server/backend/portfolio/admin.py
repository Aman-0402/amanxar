from django.contrib import admin
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
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'featured', 'status', 'year')
    list_filter = ('featured', 'status', 'year')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(AboutStat)
class AboutStatAdmin(admin.ModelAdmin):
    list_display = ('value', 'label', 'icon_name', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(WhatIDo)
class WhatIDoAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon_name', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(BioParagraph)
class BioParagraphAdmin(admin.ModelAdmin):
    list_display = ('get_text_preview', 'order')
    list_editable = ('order',)
    ordering = ('order',)

    def get_text_preview(self, obj):
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    get_text_preview.short_description = 'Text'


@admin.register(AboutHighlight)
class AboutHighlightAdmin(admin.ModelAdmin):
    list_display = ('text', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('category', 'icon', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(TechStackCategory)
class TechStackCategoryAdmin(admin.ModelAdmin):
    list_display = ('category', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(TimelineItem)
class TimelineItemAdmin(admin.ModelAdmin):
    list_display = ('year', 'title', 'type', 'order')
    list_filter = ('type',)
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'read')
    list_filter = ('read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at', 'name', 'email', 'subject', 'message')
    list_editable = ('read',)
    ordering = ('-created_at',)


@admin.register(EBook)
class EBookAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_free', 'order')
    list_filter = ('category', 'is_free')
    search_fields = ('title', 'subtitle')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(KnowledgeHubCategory)
class KnowledgeHubCategoryAdmin(admin.ModelAdmin):
    list_display = ('label', 'icon_name', 'order')
    list_editable = ('order',)
    ordering = ('order',)


@admin.register(KnowledgeTool)
class KnowledgeToolAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'pricing', 'rating', 'featured', 'order')
    list_filter = ('category', 'pricing', 'featured')
    search_fields = ('name', 'description')
    list_editable = ('order',)
    ordering = ('order',)
