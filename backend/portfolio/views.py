from rest_framework import viewsets, permissions, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
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
    StudentLearning,
    ServiceBooking,
    BookingReply,
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
    ServiceSerializer,
    NavbarLinkSerializer,
    FooterSectionSerializer,
    FooterLinkSerializer,
    FooterCTASerializer,
    SocialLinkSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    SupportTicketSerializer,
    StudentLearningSerializer,
    ServiceBookingSerializer,
    BookingReplySerializer,
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


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class NavbarLinkViewSet(viewsets.ModelViewSet):
    queryset = NavbarLink.objects.all()
    serializer_class = NavbarLinkSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class FooterSectionViewSet(viewsets.ModelViewSet):
    queryset = FooterSection.objects.all()
    serializer_class = FooterSectionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class FooterLinkViewSet(viewsets.ModelViewSet):
    queryset = FooterLink.objects.all()
    serializer_class = FooterLinkSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class FooterCTAViewSet(viewsets.ModelViewSet):
    queryset = FooterCTA.objects.all()
    serializer_class = FooterCTASerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class SocialLinkViewSet(viewsets.ModelViewSet):
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


# ── Auth Views ───────────────────────────────────────────────────────────────

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


# ── Users Views ──────────────────────────────────────────────────────────────

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, 'profile', None)
        if profile and profile.role in ('admin', 'employee'):
            return User.objects.select_related('profile').filter(profile__isnull=False).order_by('-date_joined')
        return User.objects.none()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_me(request):
    user = request.user
    profile = getattr(user, 'profile', None)
    if request.method == 'GET':
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': profile.full_name if profile else '',
            'phone': profile.phone if profile else '',
            'role': profile.role if profile else 'student',
            'date_joined': user.date_joined,
        })
    # PATCH
    if profile:
        if 'full_name' in request.data:
            profile.full_name = request.data['full_name']
        if 'phone' in request.data:
            profile.phone = request.data['phone']
        profile.save()
    if 'email' in request.data:
        user.email = request.data['email']
        user.save()
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': profile.full_name if profile else '',
        'phone': profile.phone if profile else '',
        'role': profile.role if profile else 'student',
    })


# ── Support Ticket Views ──────────────────────────────────────────────────────

class SupportTicketView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, 'profile', None)
        if profile and profile.role in ('admin', 'employee'):
            return SupportTicket.objects.select_related('user').all()
        return SupportTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ── Student Learning Views ────────────────────────────────────────────────────

class StudentLearningView(generics.ListCreateAPIView):
    serializer_class = StudentLearningSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudentLearning.objects.filter(user=self.request.user).select_related('ebook')

    def create(self, request, *args, **kwargs):
        ebook_id = request.data.get('ebook')
        obj, created = StudentLearning.objects.get_or_create(user=request.user, ebook_id=ebook_id)
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class StudentLearningDetailView(generics.DestroyAPIView):
    serializer_class = StudentLearningSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudentLearning.objects.filter(user=self.request.user)


# ── Service Booking Views ─────────────────────────────────────────────────────

class ServiceBookingListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, 'profile', None)
        qs = ServiceBooking.objects.select_related('user', 'service').prefetch_related('replies__sender__profile')
        if profile and profile.role in ('admin', 'employee'):
            return qs.all()
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ServiceBookingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ServiceBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, 'profile', None)
        qs = ServiceBooking.objects.select_related('user', 'service').prefetch_related('replies__sender__profile')
        if profile and profile.role in ('admin', 'employee'):
            return qs.all()
        return qs.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def booking_reply(request, pk):
    profile = getattr(request.user, 'profile', None)
    is_admin = profile and profile.role in ('admin', 'employee')
    try:
        booking = ServiceBooking.objects.get(pk=pk) if is_admin else ServiceBooking.objects.get(pk=pk, user=request.user)
    except ServiceBooking.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

    reply = BookingReply.objects.create(
        booking=booking,
        sender=request.user,
        is_admin=is_admin,
        message=message,
    )
    booking.status = 'replied' if is_admin else 'pending'
    booking.save()

    if not is_admin:
        booking.replies.filter(is_admin=True, read_by_student=False).update(read_by_student=True)

    return Response(BookingReplySerializer(reply).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def booking_set_status(request, pk):
    profile = getattr(request.user, 'profile', None)
    if not profile or profile.role not in ('admin', 'employee'):
        return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
    try:
        booking = ServiceBooking.objects.get(pk=pk)
    except ServiceBooking.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    new_status = request.data.get('status')
    if new_status in ('pending', 'replied', 'closed'):
        booking.status = new_status
        booking.save()
    return Response(ServiceBookingSerializer(booking).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def booking_mark_read(request, pk):
    try:
        booking = ServiceBooking.objects.get(pk=pk, user=request.user)
    except ServiceBooking.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    booking.replies.filter(is_admin=True, read_by_student=False).update(read_by_student=True)
    return Response({'status': 'ok'})
