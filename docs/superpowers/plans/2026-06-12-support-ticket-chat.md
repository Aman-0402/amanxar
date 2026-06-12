# Support Ticket Chat System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reply threading and status to SupportTicket so admin and students can have chat conversations, with SweetAlert2 notifications on unread replies.

**Architecture:** Mirror the existing BookingReply/BookingThread pattern exactly. Add `SupportTicketReply` model + `status` field, update serializer to embed replies + perspective-aware `unread_count`, add 4 new views. On the frontend, merge Support Tickets into the existing DashboardMessagesPage as a second tab, and add a My Tickets tab to StudentRequestPage.

**Tech Stack:** Django/DRF backend, React 18 + Axios frontend, SweetAlert2 for notifications, Framer Motion for animations.

---

## File Map

| File | Change |
|------|--------|
| `backend/portfolio/models.py` | Add `SupportTicketReply` model; add `status` field to `SupportTicket` |
| `backend/portfolio/serializers.py` | Add `SupportTicketReplySerializer`; rewrite `SupportTicketSerializer` |
| `backend/portfolio/views.py` | Add `SupportTicketDetailView`, `ticket_reply`, `ticket_mark_read`, `ticket_set_status`; update `SupportTicketView` queryset |
| `backend/portfolio/urls.py` | Add 4 new URL patterns; add 4 new imports |
| `client/src/services/api.js` | Extend `supportAPI` with `getById`, `reply`, `markRead`, `setStatus` |
| `client/src/pages/dashboard/DashboardMessagesPage.jsx` | Add Support Tickets tab + `SupportThread` component |
| `client/src/pages/student/StudentRequestPage.jsx` | Add My Tickets tab + `StudentSupportThread` component |

---

## Task 1: Backend — Model Changes

**Files:**
- Modify: `backend/portfolio/models.py` (SupportTicket class ~line 458, end of file ~line 478)

- [ ] **Step 1: Add `status` field to `SupportTicket` and add `SupportTicketReply` model**

In `backend/portfolio/models.py`, replace the existing `SupportTicket` class and add the new model after it:

```python
class SupportTicket(models.Model):
    CATEGORY_CHOICES = [
        ('general',   'General Question'),
        ('content',   'Content Request'),
        ('technical', 'Technical Issue'),
        ('premium',   'Premium Inquiry'),
        ('feedback',  'Feedback / Suggestion'),
        ('other',     'Other'),
    ]
    STATUS_CHOICES = [
        ('open',    'Open'),
        ('replied', 'Replied'),
        ('closed',  'Closed'),
    ]
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    category   = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    subject    = models.CharField(max_length=255)
    message    = models.TextField()
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject} - {self.user.username}'


class SupportTicketReply(models.Model):
    ticket          = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='replies')
    sender          = models.ForeignKey(User, on_delete=models.CASCADE)
    message         = models.TextField()
    is_admin        = models.BooleanField(default=False)
    read_by_student = models.BooleanField(default=False)
    read_by_admin   = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Reply #{self.ticket.id} by {self.sender.username}'
```

- [ ] **Step 2: Run migrations**

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

Expected output: migration file created, then `Running migrations: Applying portfolio.XXXX_supportticket_status_supportticketreply... OK`

- [ ] **Step 3: Commit**

```bash
git add backend/portfolio/models.py backend/portfolio/migrations/
git commit -m "feat: add SupportTicketReply model and status field"
```

---

## Task 2: Backend — Serializers

**Files:**
- Modify: `backend/portfolio/serializers.py`

- [ ] **Step 1: Import `SupportTicketReply` at top of serializers.py**

Find the models import block (around line 26–35). Add `SupportTicketReply` to it:

```python
from .models import (
    UserProfile,
    StudentLearning,
    ServiceBooking,
    BookingReply,
    SupportTicket,
    SupportTicketReply,
    Assessment,
    Question,
    AnswerOption,
    StudentAttempt,
    StudentAnswer,
    AssessmentEnrollment,
)
```

- [ ] **Step 2: Replace `SupportTicketSerializer` and add `SupportTicketReplySerializer`**

Find `class SupportTicketSerializer` (~line 272) and replace the entire class. Add `SupportTicketReplySerializer` just before it:

```python
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
```

- [ ] **Step 3: Commit**

```bash
git add backend/portfolio/serializers.py
git commit -m "feat: add SupportTicketReplySerializer and update SupportTicketSerializer"
```

---

## Task 3: Backend — Views and URLs

**Files:**
- Modify: `backend/portfolio/views.py`
- Modify: `backend/portfolio/urls.py`

- [ ] **Step 1: Import `SupportTicketReply` and `SupportTicketReplySerializer` in views.py**

In `views.py`, find the models import block (~line 25–50) and add `SupportTicketReply`:

```python
from .models import (
    UserProfile,
    StudentLearning,
    ServiceBooking,
    BookingReply,
    SupportTicket,
    SupportTicketReply,
    Assessment,
    Question,
    AnswerOption,
    StudentAttempt,
    StudentAnswer,
    AssessmentEnrollment,
)
```

And in the serializers import block, add `SupportTicketReplySerializer`:

```python
from .serializers import (
    # ... existing imports ...
    SupportTicketSerializer,
    SupportTicketReplySerializer,
    # ... rest ...
)
```

- [ ] **Step 2: Update `SupportTicketView` to prefetch replies**

Replace the existing `SupportTicketView` class (~line 341):

```python
class SupportTicketView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, 'profile', None)
        qs = SupportTicket.objects.select_related('user').prefetch_related('replies__sender__profile')
        if profile and profile.role in ('admin', 'employee'):
            return qs.all()
        return qs.filter(user=self.request.user)

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

- [ ] **Step 3: Add 4 new views after `SupportTicketView`**

Add these immediately after the `SupportTicketView` class (before the Student Learning section):

```python
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
```

- [ ] **Step 4: Update `urls.py` imports and add 4 new URL patterns**

In `backend/portfolio/urls.py`, add the 4 new views to the import:

```python
from .views import (
    # ... all existing imports ...
    SupportTicketView,
    SupportTicketDetailView,
    ticket_reply,
    ticket_mark_read,
    ticket_set_status,
    # ... rest ...
)
```

Then find `path('support/', ...)` and add 4 lines after it:

```python
path('support/',                         SupportTicketView.as_view(),       name='support'),
path('support/<int:pk>/',                SupportTicketDetailView.as_view(), name='support-detail'),
path('support/<int:pk>/reply/',          ticket_reply,                      name='ticket-reply'),
path('support/<int:pk>/read/',           ticket_mark_read,                  name='ticket-read'),
path('support/<int:pk>/status/',         ticket_set_status,                 name='ticket-status'),
```

- [ ] **Step 5: Verify server starts without errors**

```bash
python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 6: Commit**

```bash
git add backend/portfolio/views.py backend/portfolio/urls.py
git commit -m "feat: add support ticket reply/read/status views"
```

---

## Task 4: Frontend — API Service

**Files:**
- Modify: `client/src/services/api.js`

- [ ] **Step 1: Replace `supportAPI` with extended version**

Find the existing `supportAPI` object and replace it:

```js
export const supportAPI = {
  create:    (data) => api.post('/api/support/', data),
  getAll:    ()     => api.get('/api/support/'),
  getById:   (id)   => api.get(`/api/support/${id}/`),
  reply:     (id, data) => api.post(`/api/support/${id}/reply/`, data),
  markRead:  (id)   => api.post(`/api/support/${id}/read/`),
  setStatus: (id, data) => api.patch(`/api/support/${id}/status/`, data),
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/services/api.js
git commit -m "feat: extend supportAPI with reply/markRead/setStatus/getById"
```

---

## Task 5: Admin — DashboardMessagesPage (Support Tickets Tab)

**Files:**
- Modify: `client/src/pages/dashboard/DashboardMessagesPage.jsx`

- [ ] **Step 1: Rewrite `DashboardMessagesPage.jsx` with two tabs**

Replace the entire file content:

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail, Trash2, Eye, EyeOff, MessageSquare, Send, Loader2,
  ArrowRight, CheckCircle, XCircle, Clock, ChevronRight,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { messagesAPI, supportAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

// ─── Status helpers ───────────────────────────────────────────────────────────
const TICKET_STATUS_MAP = {
  open:    'bg-green-500/15 text-green-400 border-green-500/30',
  replied: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
  closed:  'bg-bg-elevated text-text-muted border-bg-border',
}

const CATEGORY_LABELS = {
  general:   'General Question',
  content:   'Content Request',
  technical: 'Technical Issue',
  premium:   'Premium Inquiry',
  feedback:  'Feedback / Suggestion',
  other:     'Other',
}

function TicketStatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${TICKET_STATUS_MAP[status] ?? TICKET_STATUS_MAP.open}`}>
      {status}
    </span>
  )
}

// ─── Support Thread (admin view) ──────────────────────────────────────────────
function SupportThread({ ticket, onBack, onReply, onStatusChange }) {
  const [msg, setMsg]         = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!msg.trim()) return
    setSending(true)
    await onReply(ticket.id, msg.trim())
    setMsg('')
    setSending(false)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:bg-bg-elevated transition-colors">
          <ArrowRight size={15} className="rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary text-sm">{ticket.subject}</h2>
          <p className="text-xs text-text-muted">
            From: <span className="text-text-secondary">{ticket.user_name}</span>
            {ticket.user_email && ` · ${ticket.user_email}`}
            {' · '}{CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          {ticket.status !== 'closed' && (
            <button onClick={() => onStatusChange(ticket.id, 'closed')} title="Close ticket"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
              <XCircle size={14} />
            </button>
          )}
          {ticket.status === 'closed' && (
            <button onClick={() => onStatusChange(ticket.id, 'open')} title="Reopen"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-green-400 hover:border-green-400/30 transition-colors">
              <CheckCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Thread body */}
      <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Original message bubble */}
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            {(ticket.user_name?.[0] || 'S').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted mb-1">{ticket.user_name} · {new Date(ticket.created_at).toLocaleDateString()}</p>
            <div className="rounded-xl rounded-tl-sm bg-bg-elevated border border-bg-border px-3 py-2 text-sm text-text-primary">
              {ticket.message}
            </div>
          </div>
        </div>

        {ticket.replies?.map(reply => (
          <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              reply.is_admin
                ? 'bg-brand-amber/20 border border-brand-amber/30 text-brand-amber'
                : 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary'
            }`}>
              {reply.is_admin ? 'A' : (ticket.user_name?.[0] || 'S').toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 ${reply.is_admin ? 'items-end flex flex-col' : ''}`}>
              <p className="text-xs text-text-muted mb-1">
                {reply.is_admin ? 'You (Admin)' : reply.sender_name} · {new Date(reply.created_at).toLocaleDateString()}
              </p>
              <div className={`rounded-xl px-3 py-2 text-sm border max-w-xs ${
                reply.is_admin
                  ? 'bg-brand-amber/8 border-brand-amber/20 text-text-primary rounded-tr-sm'
                  : 'bg-bg-elevated border-bg-border text-text-primary rounded-tl-sm'
              }`}>
                {reply.message}
              </div>
            </div>
          </div>
        ))}

        {ticket.replies?.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">No replies yet. Be the first to respond.</p>
        )}
      </div>

      {/* Reply input */}
      {ticket.status !== 'closed' && (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Reply to student…"
            className="flex-1 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <button type="submit" disabled={sending || !msg.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white disabled:opacity-40 hover:bg-brand-dark transition-colors">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      )}
      {ticket.status === 'closed' && (
        <p className="text-xs text-text-muted text-center py-2">This ticket is closed. Reopen to reply.</p>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardMessagesPage() {
  const [tab, setTab]               = useState('messages')
  const [messages, setMessages]     = useState([])
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeThread, setActiveThread] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget]       = useState(null)

  useEffect(() => {
    Promise.all([messagesAPI.getAll(), supportAPI.getAll()])
      .then(([mRes, tRes]) => {
        setMessages(mRes.data)
        setTickets(tRes.data)
        // Notify admin of unread student messages
        const unread = tRes.data.filter(t => t.unread_count > 0).length
        if (unread > 0) {
          Swal.fire({
            toast: true, position: 'top-end', icon: 'info',
            title: `${unread} unread support message${unread > 1 ? 's' : ''}`,
            timer: 4000, showConfirmButton: false, timerProgressBar: true,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchTickets = () => supportAPI.getAll().then(({ data }) => setTickets(data))
  const fetchMessages = () => messagesAPI.getAll().then(({ data }) => setMessages(data))

  const openThread = async (ticket) => {
    const { data } = await supportAPI.getById(ticket.id)
    setActiveThread(data)
    await supportAPI.markRead(ticket.id)
    fetchTickets()
  }

  const handleReply = async (ticketId, message) => {
    await supportAPI.reply(ticketId, { message })
    const { data } = await supportAPI.getById(ticketId)
    setActiveThread(data)
    fetchTickets()
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    await supportAPI.setStatus(ticketId, { status: newStatus })
    const { data } = await supportAPI.getById(ticketId)
    setActiveThread(data)
    fetchTickets()
  }

  const handleMarkAsRead = async (message) => {
    await messagesAPI.markAsRead(message.id, { read: !message.read })
    fetchMessages()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await messagesAPI.delete(deleteTarget.id)
    setDeleteModalOpen(false)
    setDeleteTarget(null)
    fetchMessages()
  }

  const unreadMsgCount    = messages.filter(m => !m.read).length
  const unreadTicketCount = tickets.filter(t => t.unread_count > 0).length

  if (loading) return <div className="p-8 text-text-muted">Loading…</div>

  // Thread view
  if (activeThread && tab === 'support') return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold text-text-primary">Messages</h1>
      <SupportThread
        ticket={activeThread}
        onBack={() => setActiveThread(null)}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
      />
    </div>
  )

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Messages</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated w-fit">
        <button onClick={() => setTab('messages')}
          className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'messages' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          <Mail size={14} /> Contact
          {unreadMsgCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadMsgCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab('support')}
          className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'support' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          <MessageSquare size={14} /> Support Tickets
          {unreadTicketCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadTicketCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Contact Messages tab ─────────────────────────────────────────────── */}
      {tab === 'messages' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-bg-border bg-bg-surface">
          <div className="p-6 border-b border-bg-border">
            <h2 className="text-xl font-bold text-text-primary">Contact Submissions ({messages.length})</h2>
          </div>
          <div className="divide-y divide-bg-border">
            {messages.length > 0 ? messages.map(message => (
              <div key={message.id}
                className={`p-6 hover:bg-bg-elevated/50 transition-colors ${!message.read ? 'bg-brand-primary/5' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-sm font-semibold ${!message.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {message.name}
                      </h3>
                      <span className="text-xs text-text-muted">{message.email}</span>
                      {!message.read && <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />}
                    </div>
                    <h4 className="font-medium text-text-primary mb-2">{message.subject}</h4>
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{message.message}</p>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {new Date(message.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleMarkAsRead(message)} title={message.read ? 'Mark unread' : 'Mark read'}
                      className="p-2 hover:bg-bg-border rounded transition-colors">
                      {message.read ? <EyeOff size={16} className="text-text-muted" /> : <Eye size={16} className="text-brand-primary" />}
                    </button>
                    <button onClick={() => { setDeleteTarget(message); setDeleteModalOpen(true) }}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded bg-bg-elevated">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-text-muted">No messages yet</div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Support Tickets tab ──────────────────────────────────────────────── */}
      {tab === 'support' && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No support tickets yet</p>
            </div>
          ) : (
            tickets.map(t => (
              <button key={t.id} onClick={() => openThread(t)}
                className="w-full text-left rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-brand-primary/30 hover:shadow-card transition-all group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">{t.subject}</p>
                      <TicketStatusBadge status={t.status} />
                      {t.unread_count > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-brand-amber text-black text-[10px] font-bold flex items-center justify-center">
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      <span className="font-medium">{t.user_name}</span>
                      {t.user_email && ` · ${t.user_email}`}
                      {' · '}<span className="text-text-muted">{CATEGORY_LABELS[t.category] ?? t.category}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(t.created_at).toLocaleDateString()}</span>
                      <span>{(t.replies?.length || 0) + 1} message{(t.replies?.length || 0) !== 0 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/dashboard/DashboardMessagesPage.jsx
git commit -m "feat: add Support Tickets tab with chat thread to DashboardMessagesPage"
```

---

## Task 6: Student — StudentRequestPage (My Tickets Tab)

**Files:**
- Modify: `client/src/pages/student/StudentRequestPage.jsx`

- [ ] **Step 1: Rewrite `StudentRequestPage.jsx` with two tabs**

Replace the entire file content:

```jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Send, CheckCircle2, Loader2, AlertCircle,
  ArrowRight, Clock, ChevronRight,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { supportAPI } from '@services/api'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

const CATEGORIES = [
  { value: 'general',   label: 'General Question' },
  { value: 'content',   label: 'Content Request' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'premium',   label: 'Premium Inquiry' },
  { value: 'feedback',  label: 'Feedback / Suggestion' },
  { value: 'other',     label: 'Other' },
]

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

const TICKET_STATUS_MAP = {
  open:    'bg-green-500/15 text-green-400 border-green-500/30',
  replied: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
  closed:  'bg-bg-elevated text-text-muted border-bg-border',
}

function TicketStatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${TICKET_STATUS_MAP[status] ?? TICKET_STATUS_MAP.open}`}>
      {status}
    </span>
  )
}

// ─── Student Support Thread ───────────────────────────────────────────────────
function StudentSupportThread({ ticket, onBack, onReply }) {
  const [msg, setMsg]         = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!msg.trim()) return
    setSending(true)
    await onReply(ticket.id, msg.trim())
    setMsg('')
    setSending(false)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:bg-bg-elevated transition-colors">
          <ArrowRight size={15} className="rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary text-sm">{ticket.subject}</h2>
          <p className="text-xs text-text-muted">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Thread body */}
      <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Original message */}
        <div className="flex gap-3 flex-row-reverse">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            Y
          </div>
          <div className="flex-1 min-w-0 items-end flex flex-col">
            <p className="text-xs text-text-muted mb-1">You · {new Date(ticket.created_at).toLocaleDateString()}</p>
            <div className="rounded-xl rounded-tr-sm bg-brand-primary/10 border border-brand-primary/20 px-3 py-2 text-sm text-text-primary max-w-xs">
              {ticket.message}
            </div>
          </div>
        </div>

        {ticket.replies?.map(reply => (
          <div key={reply.id} className={`flex gap-3 ${!reply.is_admin ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              reply.is_admin
                ? 'bg-brand-amber/20 border border-brand-amber/30 text-brand-amber'
                : 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary'
            }`}>
              {reply.is_admin ? 'A' : 'Y'}
            </div>
            <div className={`flex-1 min-w-0 ${!reply.is_admin ? 'items-end flex flex-col' : ''}`}>
              <p className="text-xs text-text-muted mb-1">
                {reply.is_admin ? 'Admin' : 'You'} · {new Date(reply.created_at).toLocaleDateString()}
              </p>
              <div className={`rounded-xl px-3 py-2 text-sm border max-w-xs ${
                reply.is_admin
                  ? 'bg-bg-elevated border-bg-border text-text-primary rounded-tl-sm'
                  : 'bg-brand-primary/10 border-brand-primary/20 text-text-primary rounded-tr-sm'
              }`}>
                {reply.message}
              </div>
            </div>
          </div>
        ))}

        {ticket.replies?.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">Waiting for admin response…</p>
        )}
      </div>

      {/* Reply input */}
      {ticket.status !== 'closed' ? (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Add a reply…"
            className="flex-1 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <button type="submit" disabled={sending || !msg.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white disabled:opacity-40 hover:bg-brand-dark transition-colors">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      ) : (
        <p className="text-xs text-text-muted text-center py-2">This ticket is closed.</p>
      )}
    </motion.div>
  )
}

// ─── New Request Form ─────────────────────────────────────────────────────────
const EMPTY = { subject: '', category: CATEGORIES[0].value, message: '' }
const ERRORS_EMPTY = { subject: '', message: '' }

function NewRequestForm({ onSuccess }) {
  const { user } = useAuth()
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState(ERRORS_EMPTY)
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.subject.trim())          e.subject = 'Subject is required'
    else if (form.subject.length < 5)  e.subject = 'At least 5 characters'
    if (!form.message.trim())          e.message = 'Message is required'
    else if (form.message.length < 20) e.message = 'At least 20 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    setApiErr('')
    try {
      await supportAPI.create({
        subject:  form.subject.trim(),
        category: form.category,
        message:  form.message.trim(),
      })
      setSuccess(true)
      onSuccess()
    } catch {
      setApiErr('Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Request Sent!</h2>
        <p className="text-text-secondary max-w-sm">Your request has been received. Check My Tickets for admin replies.</p>
        <button onClick={() => { setSuccess(false); setForm(EMPTY) }}
          className="mt-2 rounded-lg border border-bg-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          Send Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-5">
      {/* Category */}
      <div className="space-y-1">
        <label className="text-label">Category</label>
        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      {/* Subject */}
      <div className="space-y-1">
        <label className="text-label">Subject</label>
        <input type="text" value={form.subject}
          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
          onBlur={() => setErrors(p => ({ ...p, subject: validate().subject || '' }))}
          placeholder="Brief summary of your request"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-elevated focus:outline-none focus:ring-2 transition-all ${errors.subject ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20'}`}
        />
        {errors.subject && <p className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={11} /> {errors.subject}</p>}
      </div>
      {/* Message */}
      <div className="space-y-1">
        <label className="text-label">Message</label>
        <textarea rows={5} value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          onBlur={() => setErrors(p => ({ ...p, message: validate().message || '' }))}
          placeholder="Describe your question or issue in detail…"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-elevated focus:outline-none focus:ring-2 transition-all resize-none ${errors.message ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20'}`}
        />
        <div className="flex items-center justify-between">
          {errors.message ? <p className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={11} /> {errors.message}</p> : <span />}
          <span className="text-xs text-text-muted">{form.message.length} chars</span>
        </div>
      </div>
      {apiErr && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {apiErr}
        </div>
      )}
      <button type="submit" disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Request</>}
      </button>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentRequestPage() {
  const [tab, setTab]               = useState('new')
  const [tickets, setTickets]       = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [activeThread, setActiveThread]     = useState(null)
  const notifiedRef = React.useRef(false)

  const fetchTickets = async () => {
    setTicketsLoading(true)
    try {
      const { data } = await supportAPI.getAll()
      setTickets(data)
      if (!notifiedRef.current) {
        notifiedRef.current = true
        const unread = data.filter(t => t.unread_count > 0).length
        if (unread > 0) {
          Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: `Admin replied to ${unread} of your ticket${unread > 1 ? 's' : ''}`,
            timer: 4000, showConfirmButton: false, timerProgressBar: true,
          })
        }
      }
    } catch {}
    setTicketsLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  const openThread = async (ticket) => {
    const { data } = await supportAPI.getById(ticket.id)
    await supportAPI.markRead(ticket.id)
    setActiveThread(data)
    fetchTickets()
  }

  const handleReply = async (ticketId, message) => {
    await supportAPI.reply(ticketId, { message })
    const { data } = await supportAPI.getById(ticketId)
    setActiveThread(data)
    fetchTickets()
  }

  const unreadCount = tickets.filter(t => t.unread_count > 0).length

  // Thread view
  if (activeThread && tab === 'tickets') {
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-xl">
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-bold text-text-primary">Support & Requests</h1>
          <p className="text-text-secondary text-sm mt-1">Ask questions, report issues, or request content</p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <StudentSupportThread ticket={activeThread} onBack={() => setActiveThread(null)} onReply={handleReply} />
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-xl">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text-primary">Support & Requests</h1>
        <p className="text-text-secondary text-sm mt-1">Ask questions, report issues, or request content</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated w-fit">
        <button onClick={() => setTab('new')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'new' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          New Request
        </button>
        <button onClick={() => setTab('tickets')}
          className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'tickets' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          My Tickets {tickets.length > 0 && `(${tickets.length})`}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-amber text-black text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* New Request tab */}
      {tab === 'new' && (
        <motion.div variants={fadeUp}>
          <NewRequestForm onSuccess={() => { fetchTickets(); setTab('tickets') }} />
        </motion.div>
      )}

      {/* My Tickets tab */}
      {tab === 'tickets' && (
        <motion.div variants={fadeUp} className="space-y-3">
          {ticketsLoading ? (
            <div className="text-center py-12 text-text-muted"><Loader2 size={20} className="mx-auto animate-spin" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-bg-border bg-bg-surface">
              <MessageSquare size={36} className="mx-auto mb-3 text-text-muted opacity-30" />
              <p className="text-sm text-text-muted">No tickets yet. Send a request to get started.</p>
            </div>
          ) : (
            tickets.map(t => (
              <button key={t.id} onClick={() => openThread(t)}
                className="w-full text-left rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-brand-primary/30 hover:shadow-card transition-all group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">{t.subject}</p>
                      <TicketStatusBadge status={t.status} />
                      {t.unread_count > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-brand-amber text-black text-[10px] font-bold flex items-center justify-center">
                          {t.unread_count} new
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{CATEGORY_LABELS[t.category] ?? t.category}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(t.created_at).toLocaleDateString()}</span>
                      <span>{(t.replies?.length || 0) + 1} message{(t.replies?.length || 0) !== 0 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
              </button>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
```

> **Note:** Add `import React from 'react'` at the top since `React.useRef` is used, or change to `import { useState, useEffect, useRef } from 'react'` and use `useRef` directly.

- [ ] **Step 2: Fix the React import at top of file**

Make sure the import line is:
```jsx
import React, { useState, useEffect, useRef } from 'react'
```

And change `React.useRef(false)` to `useRef(false)` in the component body.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/student/StudentRequestPage.jsx
git commit -m "feat: add My Tickets tab with chat thread to StudentRequestPage"
```

---

## Task 7: Verify End-to-End

- [ ] **Step 1: Start backend and frontend**

```bash
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd client && npm run dev
```

- [ ] **Step 2: Test student flow**
  1. Log in as `student1` / `Student@123`
  2. Go to `/student/request`
  3. Submit a ticket — confirm it succeeds and auto-switches to My Tickets tab
  4. Ticket card appears with status "open"

- [ ] **Step 3: Test admin flow**
  1. Log in as `admin` / `Admin@123`
  2. Go to `/dashboard/messages` → click "Support Tickets" tab
  3. See the ticket submitted by student
  4. Click → thread opens, see original message, type a reply, send
  5. Confirm status changes to "replied"
  6. Test close/reopen buttons

- [ ] **Step 4: Test notification**
  1. While student is on request page, admin sends a reply
  2. Refresh student page — SweetAlert2 toast should fire on mount showing unread count
  3. Amber badge appears on "My Tickets" tab button

- [ ] **Step 5: Test admin unread notification**
  1. Student sends a reply from the thread
  2. Admin reloads `/dashboard/messages`
  3. SweetAlert2 toast fires on mount, amber badge on Support Tickets tab

- [ ] **Step 6: Commit if any fixes were made during testing**

```bash
git add -p
git commit -m "fix: support ticket chat edge cases from e2e testing"
```
