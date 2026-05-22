from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
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

    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
