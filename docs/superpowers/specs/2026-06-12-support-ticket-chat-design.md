# Support Ticket Chat System — Design Spec

**Date:** 2026-06-12  
**Status:** Approved

---

## Overview

Extend the existing `SupportTicket` model into a full chat thread system. Admin sees all tickets merged into the existing Messages page (new tab). Students see their own ticket history and can reply. Both sides get SweetAlert2 toast notifications on page mount when unread replies exist.

Pattern mirrors the existing `ServiceBooking` / `BookingReply` / `BookingThread` implementation.

---

## Backend

### New Model: `SupportTicketReply`

```python
class SupportTicketReply(models.Model):
    ticket          = ForeignKey(SupportTicket, on_delete=CASCADE, related_name='replies')
    sender          = ForeignKey(User, on_delete=CASCADE)
    message         = TextField()
    is_admin        = BooleanField(default=False)
    read_by_student = BooleanField(default=False)
    read_by_admin   = BooleanField(default=False)
    created_at      = DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
```

### Model Change: `SupportTicket`

Add `status` field:
```python
status = CharField(max_length=20, choices=[('open','Open'),('replied','Replied'),('closed','Closed')], default='open')
```

Status transitions:
- Student creates ticket → `open`
- Admin replies → `replied`
- Student replies → `open` (re-opens)
- Admin or student closes → `closed`

### New Serializers

**`SupportTicketReplySerializer`**  
Fields: `id`, `is_admin`, `message`, `created_at`, `sender_name`, `sender_username`, `read_by_student`, `read_by_admin`

**Updated `SupportTicketSerializer`**  
Add fields: `replies` (nested), `unread_count` (SerializerMethodField), `status`, `user_name`, `user_email`  
- For admin: `unread_count` = replies where `is_admin=False` and `read_by_admin=False`
- For student: `unread_count` = replies where `is_admin=True` and `read_by_student=False`
- Context-aware: use `request.user` to determine perspective

### New API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/support/` | auth | List tickets (admin: all; student: own) — existing, extended |
| GET | `/api/support/<id>/` | auth | Ticket detail with replies |
| POST | `/api/support/<id>/reply/` | auth | Add reply `{ message }` — sets `is_admin` from role, updates `status` |
| POST | `/api/support/<id>/read/` | auth | Mark replies as read (student marks admin replies; admin marks student replies) |
| PATCH | `/api/support/<id>/status/` | admin | Set status `{ status: 'closed'|'open' }` |

### Migration

`makemigrations && migrate` required:
- New `SupportTicketReply` table
- New `status` column on `SupportTicket`

---

## Frontend

### Admin: `DashboardMessagesPage`

Add second tab **"Support Tickets"** alongside existing "Contact Messages" tab.

**Ticket list view:**
- Cards: student name + email, subject, category badge, status badge, unread count bubble (amber)
- Sort: unread first, then by `created_at` desc
- Click card → `SupportThread` component slides in (replaces list, same pattern as `BookingThread`)

**`SupportThread` component (admin):**
- Header: back button, student name/email, subject, status badge, close/reopen button
- Thread body: messages with `is_admin` flag driving alignment (admin = right, student = left)
- Reply input + Send button at bottom
- Status controls: close ticket (XCircle), reopen (CheckCircle)
- Marks student replies as read on mount (`POST /api/support/<id>/read/`)

**Notification on mount:**
```js
// Count tickets with unread student replies
const unread = tickets.filter(t => t.unread_count > 0).length
if (unread > 0) {
  Swal.fire({ toast: true, position: 'top-end', icon: 'info',
    title: `${unread} unread support message${unread > 1 ? 's' : ''}`,
    timer: 4000, showConfirmButton: false })
}
```

---

### Student: `StudentRequestPage`

Add tabs: **"New Request"** (existing form, unchanged) | **"My Tickets"**

**My Tickets tab:**
- List of own tickets: subject, category badge, status badge, unread admin reply bubble (blue)
- Click → `StudentSupportThread` component slides in
- Empty state if no tickets yet

**`StudentSupportThread` component:**
- Header: back button, subject, category, status badge
- Thread body: student messages on right, admin on left
- Reply input only if status !== `'closed'`
- Marks admin replies as read on mount (`POST /api/support/<id>/read/`)

**Notification on mount (My Tickets tab):**
```js
const unread = tickets.filter(t => t.unread_count > 0).length
if (unread > 0) {
  Swal.fire({ toast: true, position: 'top-end', icon: 'success',
    title: `Admin replied to ${unread} of your ticket${unread > 1 ? 's' : ''}`,
    timer: 4000, showConfirmButton: false })
}
```

---

## Files Changed

| File | Change |
|------|--------|
| `backend/portfolio/models.py` | Add `SupportTicketReply`, add `status` to `SupportTicket` |
| `backend/portfolio/serializers.py` | Add `SupportTicketReplySerializer`, update `SupportTicketSerializer` |
| `backend/portfolio/views.py` | Add `ticket_reply`, `ticket_mark_read`, `ticket_set_status`, update `SupportTicketView` |
| `backend/portfolio/urls.py` | 3 new URL patterns |
| `client/src/services/api.js` | Add `supportAPI.reply()`, `supportAPI.markRead()`, `supportAPI.setStatus()`, `supportAPI.getById()` |
| `client/src/pages/dashboard/DashboardMessagesPage.jsx` | Add Support Tickets tab + `SupportThread` component |
| `client/src/pages/student/StudentRequestPage.jsx` | Add My Tickets tab + `StudentSupportThread` component |

No new routes, no new sidebar items, no new files outside of components defined inline.

---

## Constraints

- No WebSockets — notifications fire once on page mount, not in real-time
- `unread_count` computed server-side per serializer, perspective-aware (admin vs student)
- Thread locked (no reply input) when status = `closed`
- Student cannot change status; only admin can close/reopen
- Initial ticket message (the original submission) renders as first bubble in thread (student side, no `is_admin`)
