from django.db import models

class Project(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    shortDesc = models.TextField()
    longDesc = models.TextField()

    thumbnail = models.URLField(blank=True, null=True)
    images = models.JSONField(default=list)

    techStack = models.JSONField(default=list)
    categories = models.JSONField(default=list)

    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=50)

    links = models.JSONField(default=dict)

    year = models.IntegerField()
    duration = models.CharField(max_length=100, blank=True)

    highlights = models.JSONField(default=list)

    def __str__(self):
        return self.title


# ────────────────────────────────────────────────────────────────────────────
# About Section Models
# ────────────────────────────────────────────────────────────────────────────

class AboutStat(models.Model):
    icon_name = models.CharField(max_length=50)
    value = models.CharField(max_length=50)
    label = models.CharField(max_length=100)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.value} {self.label}'


class WhatIDo(models.Model):
    icon_name = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField()
    tags = models.JSONField(default=list)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'What I Do'
        verbose_name_plural = 'What I Do'

    def __str__(self):
        return self.title


class BioParagraph(models.Model):
    text = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'Paragraph {self.order + 1}'


class AboutHighlight(models.Model):
    text = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text


# ────────────────────────────────────────────────────────────────────────────
# Skills Section Models
# ────────────────────────────────────────────────────────────────────────────

class SkillCategory(models.Model):
    category = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=7)
    skills = models.JSONField(default=list)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Skill Categories'

    def __str__(self):
        return self.category


# ────────────────────────────────────────────────────────────────────────────
# Tech Stack Section Models
# ────────────────────────────────────────────────────────────────────────────

class TechStackCategory(models.Model):
    category = models.CharField(max_length=100, unique=True)
    techs = models.JSONField(default=list)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Tech Stack Category'
        verbose_name_plural = 'Tech Stack Categories'

    def __str__(self):
        return self.category


# ────────────────────────────────────────────────────────────────────────────
# Timeline / Journey Models
# ────────────────────────────────────────────────────────────────────────────

class TimelineItem(models.Model):
    TIMELINE_TYPES = [
        ('education', 'Education'),
        ('work', 'Work'),
        ('milestone', 'Milestone'),
        ('launch', 'Launch'),
    ]

    year = models.CharField(max_length=4)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TIMELINE_TYPES)
    description = models.TextField()
    tags = models.JSONField(default=list)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.year} - {self.title}'


# ────────────────────────────────────────────────────────────────────────────
# Contact Messages Model
# ────────────────────────────────────────────────────────────────────────────

class Message(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject} - {self.name}'


# ────────────────────────────────────────────────────────────────────────────
# eBook Model
# ────────────────────────────────────────────────────────────────────────────

class EBook(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list)
    gradient = models.CharField(max_length=100, default='from-blue-500 to-indigo-600')
    icon = models.URLField()
    icon_white = models.BooleanField(default=False)
    read_url = models.URLField()
    is_free = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


# ────────────────────────────────────────────────────────────────────────────
# Knowledge Hub Models
# ────────────────────────────────────────────────────────────────────────────

class KnowledgeHubCategory(models.Model):
    id = models.CharField(max_length=100, primary_key=True, unique=True)
    label = models.CharField(max_length=255)
    description = models.TextField()
    icon_name = models.CharField(max_length=50)
    color = models.CharField(max_length=7)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Knowledge Hub Categories'

    def __str__(self):
        return self.label


class KnowledgeTool(models.Model):
    PRICING_CHOICES = [
        ('free', 'Free'),
        ('freemium', 'Freemium'),
        ('paid', 'Paid'),
    ]

    id = models.CharField(max_length=100, primary_key=True, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    url = models.URLField()
    emoji = models.CharField(max_length=10, blank=True)
    category = models.ForeignKey(KnowledgeHubCategory, on_delete=models.CASCADE, related_name='tools')
    tags = models.JSONField(default=list)
    pricing = models.CharField(max_length=20, choices=PRICING_CHOICES, default='free')
    rating = models.IntegerField(default=0)
    featured = models.BooleanField(default=False)
    added_at = models.DateField(auto_now_add=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


# ────────────────────────────────────────────────────────────────────────────
# Gallery Model
# ────────────────────────────────────────────────────────────────────────────

class GalleryItem(models.Model):
    id = models.CharField(max_length=100, primary_key=True, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    image = models.URLField()
    year = models.IntegerField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', 'order']

    def __str__(self):
        return self.title