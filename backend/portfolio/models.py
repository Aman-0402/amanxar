from django.db import models
from django.contrib.auth.models import User
from .validators import validate_image_size

class Project(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    shortDesc = models.TextField()
    longDesc = models.TextField()

    thumbnail = models.ImageField(upload_to='projects/', validators=[validate_image_size], blank=True, null=True)
    images = models.JSONField(default=list)

    techStack = models.JSONField(default=list)
    categories = models.JSONField(default=list)

    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=50)

    links = models.JSONField(default=dict)

    year = models.IntegerField()
    duration = models.CharField(max_length=100, blank=True)

    highlights = models.JSONField(default=list)
    goals = models.JSONField(default=list, blank=True)
    beforeAfterImages = models.JSONField(default=dict, blank=True)
    mobileDesktopPreviews = models.JSONField(default=dict, blank=True)

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
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()

    budget = models.CharField(max_length=100, blank=True, null=True)
    timeline = models.CharField(max_length=100, blank=True, null=True)
    project_type = models.CharField(max_length=100, blank=True, null=True)
    features = models.JSONField(default=list, blank=True)
    references_url = models.URLField(blank=True, null=True)
    attachment_url = models.URLField(blank=True, null=True)

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
    image = models.ImageField(upload_to='gallery/', validators=[validate_image_size])
    year = models.IntegerField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', 'order']

    def __str__(self):
        return self.title


# ────────────────────────────────────────────────────────────────────────────
# Services Model
# ────────────────────────────────────────────────────────────────────────────

class Service(models.Model):
    id = models.CharField(max_length=100, primary_key=True, unique=True)
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    icon = models.CharField(max_length=10)
    description = models.TextField()
    features = models.JSONField(default=list)
    tiers = models.JSONField(default=list)
    cta = models.CharField(max_length=100, default='Learn More')
    cta_link = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


# ────────────────────────────────────────────────────────────────────────────
# Navbar Models
# ────────────────────────────────────────────────────────────────────────────

class NavbarLink(models.Model):
    label = models.CharField(max_length=100)
    href = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.label


# ────────────────────────────────────────────────────────────────────────────
# Footer Models
# ────────────────────────────────────────────────────────────────────────────

class FooterSection(models.Model):
    title = models.CharField(max_length=100)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class FooterLink(models.Model):
    section = models.ForeignKey(FooterSection, on_delete=models.CASCADE, related_name='links')
    label = models.CharField(max_length=255)
    href = models.CharField(max_length=255)
    external = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['section', 'order']

    def __str__(self):
        return f'{self.section.title} - {self.label}'


class FooterCTA(models.Model):
    badge_text = models.CharField(max_length=100, default='Open to opportunities')
    heading = models.CharField(max_length=255, default="Let's build something amazing together")
    button_text = models.CharField(max_length=100, default='Get in touch')
    button_url = models.CharField(max_length=255, default='/contact')

    class Meta:
        verbose_name = 'Footer CTA'
        verbose_name_plural = 'Footer CTA'

    def __str__(self):
        return 'Footer CTA Settings'

    def save(self, *args, **kwargs):
        # Ensure only one FooterCTA record exists
        if not self.pk and FooterCTA.objects.exists():
            FooterCTA.objects.all().delete()
        super().save(*args, **kwargs)


class SocialLink(models.Model):
    PLATFORM_CHOICES = [
        ('GitHub', 'GitHub'),
        ('LinkedIn', 'LinkedIn'),
        ('Twitter', 'Twitter/X'),
        ('YouTube', 'YouTube'),
        ('Email', 'Email'),
        ('Instagram', 'Instagram'),
        ('Facebook', 'Facebook'),
    ]

    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    url = models.URLField()
    icon_name = models.CharField(max_length=50)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.platform


# ────────────────────────────────────────────────────────────────────────────
# User Profile Model
# ────────────────────────────────────────────────────────────────────────────

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('employee', 'Employee'),
        ('student', 'Student'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} ({self.role})'


# ────────────────────────────────────────────────────────────────────────────
# Support Ticket Model
# ────────────────────────────────────────────────────────────────────────────

class StudentLearning(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning')
    ebook      = models.ForeignKey('EBook', on_delete=models.CASCADE, related_name='learners')
    claimed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'ebook')]
        ordering = ['-claimed_at']

    def __str__(self):
        return f'{self.user.username} → {self.ebook.title}'


class ServiceBooking(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('replied',  'Replied'),
        ('closed',   'Closed'),
    ]
    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_bookings')
    service  = models.ForeignKey('Service', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    message  = models.TextField()
    status   = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        svc = self.service.title if self.service else 'Unknown'
        return f'{self.user.username} → {svc}'


class BookingReply(models.Model):
    booking          = models.ForeignKey(ServiceBooking, on_delete=models.CASCADE, related_name='replies')
    sender           = models.ForeignKey(User, on_delete=models.CASCADE)
    is_admin         = models.BooleanField(default=False)
    message          = models.TextField()
    read_by_student  = models.BooleanField(default=False)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Reply #{self.booking.id} by {self.sender.username}'


class SupportTicket(models.Model):
    CATEGORY_CHOICES = [
        ('content', 'Content Request'),
        ('technical', 'Technical Issue'),
        ('billing', 'Billing'),
        ('ebook', 'Ebook Request'),
        ('session', 'Session Booking'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject} - {self.user.username}'


# ────────────────────────────────────────────────────────────────────────────
# Assessment Models
# ────────────────────────────────────────────────────────────────────────────

class Assessment(models.Model):
    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category    = models.CharField(max_length=100)
    tags        = models.JSONField(default=list)
    is_free     = models.BooleanField(default=True)
    time_limit  = models.IntegerField(null=True, blank=True, help_text='Minutes, null = no limit')
    pass_mark   = models.IntegerField(default=60, help_text='Minimum % to pass')
    is_active   = models.BooleanField(default=True)
    order       = models.IntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class Question(models.Model):
    TYPE_CHOICES = [
        ('mcq_single', 'MCQ — Single correct'),
        ('mcq_multi',  'MCQ — Multiple correct'),
        ('true_false', 'True / False'),
    ]
    assessment  = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    type        = models.CharField(max_length=20, choices=TYPE_CHOICES, default='mcq_single')
    text        = models.TextField()
    explanation = models.TextField(blank=True)
    order       = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'Q{self.order + 1}: {self.text[:60]}'


class AnswerOption(models.Model):
    question   = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text       = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order      = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{"✓" if self.is_correct else "✗"} {self.text[:40]}'


class StudentAttempt(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed',   'Completed'),
    ]
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    assessment   = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='attempts')
    started_at   = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score        = models.IntegerField(default=0)
    total        = models.IntegerField(default=0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')

    class Meta:
        unique_together = [('user', 'assessment')]
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.user.username} → {self.assessment.title}'

    @property
    def percentage(self):
        return round(self.score / self.total * 100) if self.total else 0

    @property
    def passed(self):
        return self.percentage >= self.assessment.pass_mark


class StudentAnswer(models.Model):
    attempt          = models.ForeignKey(StudentAttempt, on_delete=models.CASCADE, related_name='answers')
    question         = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_options = models.JSONField(default=list)

    class Meta:
        unique_together = [('attempt', 'question')]

    def __str__(self):
        return f'{self.attempt.user.username} → Q{self.question.id}'


class AssessmentEnrollment(models.Model):
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_enrollments')
    assessment  = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'assessment')]
        ordering = ['-enrolled_at']

    def __str__(self):
        return f'{self.user.username} → {self.assessment.title}'