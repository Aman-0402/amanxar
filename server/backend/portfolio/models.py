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