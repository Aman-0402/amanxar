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
