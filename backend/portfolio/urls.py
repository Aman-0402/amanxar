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
    user_me,
    SupportTicketView,
    StudentLearningView,
    StudentLearningDetailView,
    ServiceBookingListCreateView,
    ServiceBookingDetailView,
    booking_reply,
    booking_set_status,
    booking_mark_read,
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

    path('support/', SupportTicketView.as_view(), name='support'),

    path('learning/',          StudentLearningView.as_view(),       name='learning-list'),
    path('learning/<int:pk>/', StudentLearningDetailView.as_view(), name='learning-detail'),

    path('bookings/',                        ServiceBookingListCreateView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/',               ServiceBookingDetailView.as_view(),     name='booking-detail'),
    path('bookings/<int:pk>/reply/',         booking_reply,                          name='booking-reply'),
    path('bookings/<int:pk>/status/',        booking_set_status,                     name='booking-status'),
    path('bookings/<int:pk>/read/',          booking_mark_read,                      name='booking-read'),
]
