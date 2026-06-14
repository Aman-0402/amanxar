from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    ProjectViewSet,
    AboutStatViewSet,
    WhatIDoViewSet,
    BioParagraphViewSet,
    AboutHighlightViewSet,
    SkillCategoryViewSet,
    TechStackCategoryViewSet,
    TimelineItemViewSet,
    MessageViewSet,
    EBookViewSet,
    KnowledgeHubCategoryViewSet,
    KnowledgeToolViewSet,
    GalleryItemViewSet,
    ServiceViewSet,
    NavbarLinkViewSet,
    FooterSectionViewSet,
    FooterLinkViewSet,
    FooterCTAViewSet,
    SocialLinkViewSet,
    CustomTokenObtainPairView,
    RegisterView,
    UserListView,
    UserDetailView,
    update_user_role,
    user_me,
    SupportTicketView,
    SupportTicketDetailView,
    ticket_reply,
    ticket_mark_read,
    ticket_set_status,
    StudentLearningView,
    StudentLearningDetailView,
    ServiceBookingListCreateView,
    ServiceBookingDetailView,
    booking_reply,
    booking_set_status,
    booking_mark_read,
    assessment_list_create,
    assessment_detail,
    question_list_create,
    question_detail,
    option_list_create,
    option_detail,
    start_attempt,
    submit_attempt,
    attempt_result,
    assessment_leaderboard,
    enrollment_list,
    enroll_student,
    unenroll_student,
    assessment_attempts,
    public_stats,
    change_password,
)

app_name = 'portfolio'

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'about/stats', AboutStatViewSet, basename='about-stat')
router.register(r'about/what-i-do', WhatIDoViewSet, basename='about-what-i-do')
router.register(r'about/bio', BioParagraphViewSet, basename='about-bio')
router.register(r'about/highlights', AboutHighlightViewSet, basename='about-highlight')
router.register(r'skills', SkillCategoryViewSet, basename='skill-category')
router.register(r'tech-stack', TechStackCategoryViewSet, basename='tech-stack-category')
router.register(r'timeline', TimelineItemViewSet, basename='timeline-item')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'ebooks', EBookViewSet, basename='ebook')
router.register(r'gallery', GalleryItemViewSet, basename='gallery-item')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'knowledge-hub', KnowledgeHubCategoryViewSet, basename='knowledge-hub-category')
router.register(r'knowledge-tools', KnowledgeToolViewSet, basename='knowledge-tool')
router.register(r'navbar-links', NavbarLinkViewSet, basename='navbar-link')
router.register(r'footer-sections', FooterSectionViewSet, basename='footer-section')
router.register(r'footer-links', FooterLinkViewSet, basename='footer-link')
router.register(r'footer-cta', FooterCTAViewSet, basename='footer-cta')
router.register(r'social-links', SocialLinkViewSet, basename='social-link')

urlpatterns = [
    *router.urls,

    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('users/', UserListView.as_view(), name='user-list'),
    path('users/me/', user_me, name='user-me'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/role/', update_user_role, name='user-update-role'),

    path('support/',                         SupportTicketView.as_view(),       name='support'),
    path('support/<int:pk>/',                SupportTicketDetailView.as_view(), name='support-detail'),
    path('support/<int:pk>/reply/',          ticket_reply,                      name='ticket-reply'),
    path('support/<int:pk>/read/',           ticket_mark_read,                  name='ticket-read'),
    path('support/<int:pk>/status/',         ticket_set_status,                 name='ticket-status'),

    path('learning/',          StudentLearningView.as_view(),       name='learning-list'),
    path('learning/<int:pk>/', StudentLearningDetailView.as_view(), name='learning-detail'),

    path('bookings/',                        ServiceBookingListCreateView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/',               ServiceBookingDetailView.as_view(),     name='booking-detail'),
    path('bookings/<int:pk>/reply/',         booking_reply,                          name='booking-reply'),
    path('bookings/<int:pk>/status/',        booking_set_status,                     name='booking-status'),
    path('bookings/<int:pk>/read/',          booking_mark_read,                      name='booking-read'),

    path('assessments/',                                    assessment_list_create,  name='assessment-list'),
    path('assessments/<int:pk>/',                           assessment_detail,       name='assessment-detail'),
    path('assessments/<int:assessment_pk>/questions/',      question_list_create,    name='question-list'),
    path('assessments/<int:assessment_pk>/start/',          start_attempt,           name='start-attempt'),
    path('assessments/<int:assessment_pk>/leaderboard/',    assessment_leaderboard,  name='assessment-leaderboard'),
    path('questions/<int:pk>/',                             question_detail,         name='question-detail'),
    path('questions/<int:question_pk>/options/',            option_list_create,      name='option-list'),
    path('options/<int:pk>/',                               option_detail,           name='option-detail'),
    path('attempts/<int:attempt_pk>/submit/',               submit_attempt,          name='submit-attempt'),
    path('attempts/<int:attempt_pk>/result/',               attempt_result,          name='attempt-result'),

    path('assessments/<int:assessment_pk>/all-attempts/',             assessment_attempts, name='assessment-attempts'),
    path('assessments/<int:assessment_pk>/enrollments/',              enrollment_list,   name='enrollment-list'),
    path('assessments/<int:assessment_pk>/enroll/',                   enroll_student,    name='enroll-student'),
    path('assessments/<int:assessment_pk>/enrollments/<int:user_pk>/', unenroll_student, name='unenroll-student'),

    path('public/stats/', public_stats, name='public-stats'),
    path('users/me/change-password/', change_password, name='change-password'),
]
