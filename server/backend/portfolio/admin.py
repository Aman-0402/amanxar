from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'featured', 'status', 'year')
    list_filter = ('featured', 'status', 'year')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
