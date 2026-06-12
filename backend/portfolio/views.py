from rest_framework import viewsets, permissions, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
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
    SupportTicketReplySerializer,
    StudentLearningSerializer,
    ServiceBookingSerializer,
    BookingReplySerializer,
    AssessmentListSerializer,
    AssessmentDetailAdminSerializer,
    AssessmentDetailStudentSerializer,
    QuestionAdminSerializer,
    AnswerOptionSerializer,
    StudentAttemptSerializer,
    AssessmentEnrollmentSerializer,
    AttemptAdminSerializer,
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
        u = self.request.user
        profile = getattr(u, 'profile', None)
        is_admin = (profile and profile.role in ('admin', 'employee')) or u.is_staff or u.is_superuser
        if is_admin:
            return User.objects.select_related('profile').order_by('-date_joined')
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
            'role': profile.role if profile else ('admin' if user.is_staff or user.is_superuser else 'student'),
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

    def _is_admin(self):
        u = self.request.user
        profile = getattr(u, 'profile', None)
        return (profile and profile.role in ('admin', 'employee')) or u.is_staff or u.is_superuser

    def get_queryset(self):
        qs = SupportTicket.objects.select_related('user').prefetch_related('replies__sender__profile')
        return qs.all() if self._is_admin() else qs.filter(user=self.request.user)

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SupportTicketDetailView(generics.RetrieveAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def _is_admin(self):
        u = self.request.user
        profile = getattr(u, 'profile', None)
        return (profile and profile.role in ('admin', 'employee')) or u.is_staff or u.is_superuser

    def get_queryset(self):
        qs = SupportTicket.objects.select_related('user').prefetch_related('replies__sender__profile')
        return qs.all() if self._is_admin() else qs.filter(user=self.request.user)

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ticket_reply(request, pk):
    profile = getattr(request.user, 'profile', None)
    is_admin = (profile and profile.role in ('admin', 'employee')) or request.user.is_staff or request.user.is_superuser
    try:
        ticket = SupportTicket.objects.get(pk=pk) if is_admin else SupportTicket.objects.get(pk=pk, user=request.user)
    except SupportTicket.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

    reply = SupportTicketReply.objects.create(
        ticket=ticket,
        sender=request.user,
        is_admin=is_admin,
        message=message,
    )
    ticket.status = 'replied' if is_admin else 'open'
    ticket.save()

    if not is_admin:
        ticket.replies.filter(is_admin=True, read_by_student=False).update(read_by_student=True)

    return Response(SupportTicketReplySerializer(reply).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ticket_mark_read(request, pk):
    profile = getattr(request.user, 'profile', None)
    is_admin = (profile and profile.role in ('admin', 'employee')) or request.user.is_staff or request.user.is_superuser
    try:
        ticket = SupportTicket.objects.get(pk=pk) if is_admin else SupportTicket.objects.get(pk=pk, user=request.user)
    except SupportTicket.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if is_admin:
        ticket.replies.filter(is_admin=False, read_by_admin=False).update(read_by_admin=True)
    else:
        ticket.replies.filter(is_admin=True, read_by_student=False).update(read_by_student=True)

    return Response({'ok': True})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def ticket_set_status(request, pk):
    profile = getattr(request.user, 'profile', None)
    is_admin = (profile and profile.role in ('admin', 'employee')) or request.user.is_staff or request.user.is_superuser
    if not is_admin:
        return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
    try:
        ticket = SupportTicket.objects.get(pk=pk)
    except SupportTicket.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    new_status = request.data.get('status')
    if new_status in ('open', 'replied', 'closed'):
        ticket.status = new_status
        ticket.save()
    return Response({'status': ticket.status})


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

    def _is_admin(self):
        u = self.request.user
        profile = getattr(u, 'profile', None)
        return (profile and profile.role in ('admin', 'employee')) or u.is_staff or u.is_superuser

    def get_queryset(self):
        qs = ServiceBooking.objects.select_related('user', 'service').prefetch_related('replies__sender__profile')
        return qs.all() if self._is_admin() else qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ServiceBookingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ServiceBookingSerializer
    permission_classes = [IsAuthenticated]

    def _is_admin(self):
        u = self.request.user
        profile = getattr(u, 'profile', None)
        return (profile and profile.role in ('admin', 'employee')) or u.is_staff or u.is_superuser

    def get_queryset(self):
        qs = ServiceBooking.objects.select_related('user', 'service').prefetch_related('replies__sender__profile')
        return qs.all() if self._is_admin() else qs.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def booking_reply(request, pk):
    profile = getattr(request.user, 'profile', None)
    is_admin = (profile and profile.role in ('admin', 'employee')) or request.user.is_staff or request.user.is_superuser
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
    is_admin = (profile and profile.role in ('admin', 'employee')) or request.user.is_staff or request.user.is_superuser
    if not is_admin:
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


# ── Assessment Views ──────────────────────────────────────────────────────────

def _is_admin_user(user):
    profile = getattr(user, 'profile', None)
    return (profile and profile.role in ('admin', 'employee')) or user.is_staff or user.is_superuser


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def assessment_list_create(request):
    is_admin = _is_admin_user(request.user)

    if request.method == 'GET':
        qs = Assessment.objects.all() if is_admin else Assessment.objects.filter(is_active=True)
        return Response(AssessmentListSerializer(qs, many=True, context={'request': request}).data)

    if not is_admin:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    s = AssessmentListSerializer(data=request.data)
    if s.is_valid():
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def assessment_detail(request, pk):
    is_admin = _is_admin_user(request.user)
    try:
        obj = Assessment.objects.get(pk=pk)
    except Assessment.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if not is_admin and not obj.is_active:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if is_admin:
            return Response(AssessmentDetailAdminSerializer(obj).data)
        return Response(AssessmentDetailStudentSerializer(obj, context={'request': request}).data)

    if not is_admin:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if request.method in ('PUT', 'PATCH'):
        s = AssessmentListSerializer(obj, data=request.data, partial=(request.method == 'PATCH'))
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    obj.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def question_list_create(request, assessment_pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assessment = Assessment.objects.get(pk=assessment_pk)
    except Assessment.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(QuestionAdminSerializer(assessment.questions.all(), many=True).data)

    q = Question.objects.create(
        assessment=assessment,
        type=request.data.get('type', 'mcq_single'),
        text=request.data.get('text', ''),
        explanation=request.data.get('explanation', ''),
        order=request.data.get('order', assessment.questions.count()),
    )
    return Response(QuestionAdminSerializer(q).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def question_detail(request, pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        q = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(QuestionAdminSerializer(q).data)

    if request.method in ('PUT', 'PATCH'):
        for field in ('type', 'text', 'explanation', 'order'):
            if field in request.data:
                setattr(q, field, request.data[field])
        q.save()
        return Response(QuestionAdminSerializer(q).data)

    q.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def option_list_create(request, question_pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        question = Question.objects.get(pk=question_pk)
    except Question.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(AnswerOptionSerializer(question.options.all(), many=True).data)

    opt = AnswerOption.objects.create(
        question=question,
        text=request.data.get('text', ''),
        is_correct=request.data.get('is_correct', False),
        order=request.data.get('order', question.options.count()),
    )
    return Response(AnswerOptionSerializer(opt).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def option_detail(request, pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        opt = AnswerOption.objects.get(pk=pk)
    except AnswerOption.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(AnswerOptionSerializer(opt).data)

    if request.method in ('PUT', 'PATCH'):
        for field in ('text', 'is_correct', 'order'):
            if field in request.data:
                setattr(opt, field, request.data[field])
        opt.save()
        return Response(AnswerOptionSerializer(opt).data)

    opt.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_attempt(request, assessment_pk):
    try:
        assessment = Assessment.objects.get(pk=assessment_pk, is_active=True)
    except Assessment.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if not assessment.is_free:
        is_admin = _is_admin_user(request.user)
        enrolled = AssessmentEnrollment.objects.filter(
            user=request.user, assessment=assessment
        ).exists()
        if not is_admin and not enrolled:
            return Response(
                {'error': 'not_enrolled', 'message': 'This is a premium exam. Contact admin to get access.'},
                status=status.HTTP_403_FORBIDDEN,
            )

    attempt, created = StudentAttempt.objects.get_or_create(
        user=request.user,
        assessment=assessment,
        defaults={'status': 'in_progress'},
    )
    return Response(
        StudentAttemptSerializer(attempt).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_attempt(request, attempt_pk):
    try:
        attempt = StudentAttempt.objects.get(pk=attempt_pk, user=request.user)
    except StudentAttempt.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if attempt.status == 'completed':
        return Response({'error': 'Already submitted'}, status=status.HTTP_400_BAD_REQUEST)

    answers = request.data.get('answers', [])

    with transaction.atomic():
        for ans in answers:
            StudentAnswer.objects.update_or_create(
                attempt=attempt,
                question_id=ans.get('question_id'),
                defaults={'selected_options': ans.get('selected_option_ids', [])},
            )

        questions = attempt.assessment.questions.prefetch_related('options').all()
        saved_ans = {a.question_id: set(a.selected_options) for a in attempt.answers.all()}
        score     = 0

        for q in questions:
            correct = set(q.options.filter(is_correct=True).values_list('id', flat=True))
            if saved_ans.get(q.id, set()) == correct:
                score += 1

        attempt.score        = score
        attempt.total        = questions.count()
        attempt.status       = 'completed'
        attempt.submitted_at = timezone.now()
        attempt.save()

    return Response(StudentAttemptSerializer(attempt).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attempt_result(request, attempt_pk):
    try:
        attempt = StudentAttempt.objects.get(pk=attempt_pk, user=request.user, status='completed')
    except StudentAttempt.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    questions = attempt.assessment.questions.prefetch_related('options').all()
    saved_ans = {a.question_id: a.selected_options for a in attempt.answers.all()}

    result_qs = []
    for q in questions:
        correct_ids = list(q.options.filter(is_correct=True).values_list('id', flat=True))
        selected    = saved_ans.get(q.id, [])
        result_qs.append({
            'id':          q.id,
            'type':        q.type,
            'text':        q.text,
            'explanation': q.explanation,
            'options':     AnswerOptionSerializer(q.options.all(), many=True).data,
            'correct_ids': correct_ids,
            'selected':    selected,
            'is_correct':  set(selected) == set(correct_ids),
        })

    return Response({**StudentAttemptSerializer(attempt).data, 'questions': result_qs})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_leaderboard(request, assessment_pk):
    try:
        assessment = Assessment.objects.get(pk=assessment_pk)
    except Assessment.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    top = (StudentAttempt.objects
           .filter(assessment=assessment, status='completed')
           .select_related('user__profile')
           .order_by('-score', 'submitted_at')[:10])

    data = []
    for rank, a in enumerate(top, 1):
        profile = getattr(a.user, 'profile', None)
        data.append({
            'rank':       rank,
            'user':       profile.full_name if profile else a.user.username,
            'score':      a.score,
            'total':      a.total,
            'percentage': a.percentage,
            'passed':     a.passed,
        })

    return Response(data)


# ── Enrollment Views (premium exam access) ───────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrollment_list(request, assessment_pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assessment = Assessment.objects.get(pk=assessment_pk)
    except Assessment.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    enrollments = assessment.enrollments.select_related('user__profile').all()
    return Response(AssessmentEnrollmentSerializer(enrollments, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_student(request, assessment_pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assessment = Assessment.objects.get(pk=assessment_pk)
    except Assessment.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    user_id = request.data.get('user_id')
    try:
        student = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    enrollment, created = AssessmentEnrollment.objects.get_or_create(
        user=student, assessment=assessment
    )
    return Response(
        AssessmentEnrollmentSerializer(enrollment).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_attempts(request, assessment_pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    try:
        assessment = Assessment.objects.get(pk=assessment_pk)
    except Assessment.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    attempts = (StudentAttempt.objects
                .filter(assessment=assessment)
                .select_related('user__profile')
                .order_by('-started_at'))
    return Response(AttemptAdminSerializer(attempts, many=True).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unenroll_student(request, assessment_pk, user_pk):
    if not _is_admin_user(request.user):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    deleted, _ = AssessmentEnrollment.objects.filter(
        assessment_id=assessment_pk, user_id=user_pk
    ).delete()
    if not deleted:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)
