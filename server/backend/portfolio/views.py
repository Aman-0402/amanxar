from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
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
)
from .serializers import (
    ProjectSerializer,
    AboutStatSerializer,
    WhatIDoSerializer,
    BioParagraphSerializer,
    AboutHighlightSerializer,
    SkillCategorySerializer,
    TechStackCategorySerializer,
    TimelineItemSerializer,
    MessageSerializer,
    EBookSerializer,
    KnowledgeHubCategorySerializer,
    KnowledgeToolSerializer,
    GalleryItemSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class AboutStatViewSet(viewsets.ModelViewSet):
    queryset = AboutStat.objects.all()
    serializer_class = AboutStatSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class WhatIDoViewSet(viewsets.ModelViewSet):
    queryset = WhatIDo.objects.all()
    serializer_class = WhatIDoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class BioParagraphViewSet(viewsets.ModelViewSet):
    queryset = BioParagraph.objects.all()
    serializer_class = BioParagraphSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class AboutHighlightViewSet(viewsets.ModelViewSet):
    queryset = AboutHighlight.objects.all()
    serializer_class = AboutHighlightSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class SkillCategoryViewSet(viewsets.ModelViewSet):
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class TechStackCategoryViewSet(viewsets.ModelViewSet):
    queryset = TechStackCategory.objects.all()
    serializer_class = TechStackCategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class TimelineItemViewSet(viewsets.ModelViewSet):
    queryset = TimelineItem.objects.all()
    serializer_class = TimelineItemSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]


class EBookViewSet(viewsets.ModelViewSet):
    queryset = EBook.objects.all()
    serializer_class = EBookSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class KnowledgeHubCategoryViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeHubCategory.objects.prefetch_related('tools')
    serializer_class = KnowledgeHubCategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class KnowledgeToolViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeTool.objects.all()
    serializer_class = KnowledgeToolSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class GalleryItemViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
