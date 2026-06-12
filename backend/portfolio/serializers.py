from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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
    UserProfile,
    SupportTicket,
    SupportTicketReply,
    StudentLearning,
    ServiceBooking,
    BookingReply,
    Assessment,
    Question,
    AnswerOption,
    StudentAttempt,
    StudentAnswer,
    AssessmentEnrollment,
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
            'goals',
            'beforeAfterImages',
            'mobileDesktopPreviews',
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
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'budget', 'timeline', 'project_type', 'features', 'references_url', 'attachment_url',
            'created_at', 'read'
        ]
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
        fields = ['id', 'slug', 'title', 'icon', 'description', 'features', 'tiers', 'cta', 'cta_link', 'order']
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


# ── Auth / User Serializers ──────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        profile = getattr(user, 'profile', None)
        if profile:
            role = profile.role
        elif user.is_superuser or user.is_staff:
            role = 'admin'
        else:
            role = 'student'
        token['role'] = role
        token['full_name'] = profile.full_name if profile else (user.get_full_name() or user.username)
        token['email'] = user.email
        token['username'] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        phone = validated_data.pop('phone', '')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, full_name=full_name, phone=phone, role='student')
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'date_joined']

    def get_full_name(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.full_name if profile else ''

    def get_phone(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.phone if profile else ''

    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.role if profile else 'student'


class SupportTicketReplySerializer(serializers.ModelSerializer):
    sender_name     = serializers.SerializerMethodField()
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = SupportTicketReply
        fields = [
            'id', 'is_admin', 'message', 'created_at',
            'sender_name', 'sender_username', 'read_by_student', 'read_by_admin',
        ]
        read_only_fields = [
            'id', 'created_at', 'is_admin',
            'sender_name', 'sender_username', 'read_by_student', 'read_by_admin',
        ]

    def get_sender_name(self, obj):
        profile = getattr(obj.sender, 'profile', None)
        return profile.full_name if profile else obj.sender.username


class SupportTicketSerializer(serializers.ModelSerializer):
    replies      = SupportTicketReplySerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()
    user_name    = serializers.SerializerMethodField()
    user_email   = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'category', 'subject', 'message', 'status', 'created_at',
            'replies', 'unread_count', 'user_name', 'user_email',
        ]
        read_only_fields = [
            'id', 'created_at', 'status',
            'user_name', 'user_email', 'replies', 'unread_count',
        ]

    def get_user_name(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return profile.full_name if profile else obj.user.username

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request is None:
            return 0
        profile = getattr(request.user, 'profile', None)
        is_admin = (
            (profile and profile.role in ('admin', 'employee'))
            or request.user.is_staff
            or request.user.is_superuser
        )
        if is_admin:
            return obj.replies.filter(is_admin=False, read_by_admin=False).count()
        return obj.replies.filter(is_admin=True, read_by_student=False).count()


class StudentLearningSerializer(serializers.ModelSerializer):
    ebook_title    = serializers.CharField(source='ebook.title',    read_only=True)
    ebook_subtitle = serializers.CharField(source='ebook.subtitle', read_only=True)
    ebook_slug     = serializers.CharField(source='ebook.slug',     read_only=True)
    ebook_category = serializers.CharField(source='ebook.category', read_only=True)
    ebook_gradient = serializers.CharField(source='ebook.gradient', read_only=True)
    ebook_icon     = serializers.CharField(source='ebook.icon',     read_only=True)
    ebook_icon_white = serializers.BooleanField(source='ebook.icon_white', read_only=True)
    ebook_read_url = serializers.CharField(source='ebook.read_url', read_only=True)
    ebook_is_free  = serializers.BooleanField(source='ebook.is_free', read_only=True)
    ebook_tags     = serializers.JSONField(source='ebook.tags',     read_only=True)

    class Meta:
        model = StudentLearning
        fields = [
            'id', 'ebook', 'claimed_at',
            'ebook_title', 'ebook_subtitle', 'ebook_slug', 'ebook_category',
            'ebook_gradient', 'ebook_icon', 'ebook_icon_white', 'ebook_read_url',
            'ebook_is_free', 'ebook_tags',
        ]
        read_only_fields = ['id', 'claimed_at']


class BookingReplySerializer(serializers.ModelSerializer):
    sender_name     = serializers.SerializerMethodField()
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = BookingReply
        fields = ['id', 'is_admin', 'message', 'created_at', 'sender_name', 'sender_username', 'read_by_student']
        read_only_fields = ['id', 'created_at', 'is_admin', 'sender_name', 'sender_username', 'read_by_student']

    def get_sender_name(self, obj):
        profile = getattr(obj.sender, 'profile', None)
        return profile.full_name if profile else obj.sender.username


class ServiceBookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True, default='')
    user_name     = serializers.SerializerMethodField()
    user_email    = serializers.CharField(source='user.email', read_only=True)
    replies       = BookingReplySerializer(many=True, read_only=True)
    unread_count  = serializers.SerializerMethodField()

    class Meta:
        model = ServiceBooking
        fields = [
            'id', 'service', 'service_title', 'user_name', 'user_email',
            'message', 'status', 'created_at', 'updated_at',
            'replies', 'unread_count',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'service_title', 'user_name', 'user_email']

    def get_user_name(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return profile.full_name if profile else obj.user.username

    def get_unread_count(self, obj):
        return obj.replies.filter(is_admin=True, read_by_student=False).count()


# ── Assessment Serializers ────────────────────────────────────────────────────

class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AnswerOption
        fields = ['id', 'text', 'is_correct', 'order']
        read_only_fields = ['id']


class AnswerOptionPublicSerializer(serializers.ModelSerializer):
    """Hides is_correct — used when student is actively taking an exam."""
    class Meta:
        model  = AnswerOption
        fields = ['id', 'text', 'order']
        read_only_fields = ['id']


class QuestionAdminSerializer(serializers.ModelSerializer):
    options = AnswerOptionSerializer(many=True, read_only=True)

    class Meta:
        model  = Question
        fields = ['id', 'type', 'text', 'explanation', 'order', 'options']
        read_only_fields = ['id']


class QuestionPublicSerializer(serializers.ModelSerializer):
    options = AnswerOptionPublicSerializer(many=True, read_only=True)

    class Meta:
        model  = Question
        fields = ['id', 'type', 'text', 'order', 'options']
        read_only_fields = ['id']


class AssessmentListSerializer(serializers.ModelSerializer):
    question_count  = serializers.SerializerMethodField()
    attempt_count   = serializers.SerializerMethodField()
    enrolled_count  = serializers.SerializerMethodField()
    user_attempt    = serializers.SerializerMethodField()
    is_enrolled     = serializers.SerializerMethodField()

    class Meta:
        model  = Assessment
        fields = [
            'id', 'title', 'description', 'category', 'tags',
            'is_free', 'time_limit', 'pass_mark', 'is_active',
            'order', 'created_at', 'question_count', 'attempt_count',
            'enrolled_count', 'user_attempt', 'is_enrolled',
        ]
        read_only_fields = ['id', 'created_at']

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_attempt_count(self, obj):
        return obj.attempts.filter(status='completed').count()

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()

    def get_user_attempt(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        attempt = obj.attempts.filter(user=request.user).first()
        if not attempt:
            return None
        return {
            'id':         attempt.id,
            'status':     attempt.status,
            'score':      attempt.score,
            'total':      attempt.total,
            'percentage': attempt.percentage,
            'passed':     attempt.passed,
        }

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if obj.is_free:
            return True
        return obj.enrollments.filter(user=request.user).exists()


class AssessmentDetailAdminSerializer(AssessmentListSerializer):
    questions = QuestionAdminSerializer(many=True, read_only=True)

    class Meta(AssessmentListSerializer.Meta):
        fields = AssessmentListSerializer.Meta.fields + ['questions']


class AssessmentDetailStudentSerializer(AssessmentListSerializer):
    questions    = QuestionPublicSerializer(many=True, read_only=True)
    user_attempt = serializers.SerializerMethodField()

    class Meta(AssessmentListSerializer.Meta):
        fields = AssessmentListSerializer.Meta.fields + ['questions', 'user_attempt']

    def get_user_attempt(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        attempt = obj.attempts.filter(user=request.user).first()
        if not attempt:
            return None
        return {
            'id':           attempt.id,
            'status':       attempt.status,
            'score':        attempt.score,
            'total':        attempt.total,
            'percentage':   attempt.percentage,
            'passed':       attempt.passed,
            'submitted_at': attempt.submitted_at,
        }


class StudentAttemptSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    passed     = serializers.ReadOnlyField()

    class Meta:
        model  = StudentAttempt
        fields = ['id', 'assessment', 'started_at', 'submitted_at',
                  'score', 'total', 'status', 'percentage', 'passed']
        read_only_fields = ['id', 'started_at']


class AssessmentEnrollmentSerializer(serializers.ModelSerializer):
    user_id       = serializers.IntegerField(source='user.id',       read_only=True)
    username      = serializers.CharField(source='user.username',    read_only=True)
    full_name     = serializers.SerializerMethodField()
    email         = serializers.CharField(source='user.email',       read_only=True)

    class Meta:
        model  = AssessmentEnrollment
        fields = ['id', 'user_id', 'username', 'full_name', 'email', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']

    def get_full_name(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return profile.full_name if profile else obj.user.username


class AttemptAdminSerializer(serializers.ModelSerializer):
    user_id    = serializers.IntegerField(source='user.id',      read_only=True)
    username   = serializers.CharField(source='user.username',   read_only=True)
    email      = serializers.CharField(source='user.email',      read_only=True)
    full_name  = serializers.SerializerMethodField()
    percentage = serializers.ReadOnlyField()
    passed     = serializers.ReadOnlyField()

    class Meta:
        model  = StudentAttempt
        fields = [
            'id', 'user_id', 'username', 'full_name', 'email',
            'started_at', 'submitted_at', 'score', 'total',
            'status', 'percentage', 'passed',
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return profile.full_name if profile else obj.user.username
