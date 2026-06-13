# TEST.md — Production Readiness Audit

**Audited**: June 2026  
**Status**: ❌ NOT production-ready — 5 critical blockers must be fixed before going live

---

## 🔴 CRITICAL — Will Break in Production

### 1. API URL hardcoded to `localhost:8000`
**File**: `client/src/services/api.js:3`
```js
const API_BASE_URL = 'http://localhost:8000'  // ← BREAKS IN PRODUCTION
```
**Impact**: Every single API call fails. Frontend cannot talk to backend at all.  
**Fix**: Use env variable:
```js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```
Then set `VITE_API_URL=https://your-backend-domain.com` in production `.env`.

---

### 2. `imageUrl.js` also hardcodes `localhost:8000`
**File**: `client/src/utils/imageUrl.js:16`
```js
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
```
**Impact**: All gallery images, project thumbnails, media files load from localhost → broken images in production.  
**Fix**: Use same env var as above. Also align naming — currently `VITE_API_BASE_URL` (imageUrl.js) vs `VITE_API_URL` (not yet in api.js). Pick one name and use it everywhere.

---

### 3. `DEBUG = True` in Django settings
**File**: `backend/backend/settings.py:7`
```python
DEBUG = True
```
**Impact**:
- Full Python stack traces exposed to users on any error → information disclosure
- Django's runserver is used — not suitable for production (single-threaded, no keepalive)
- Static files not properly served (Django dev server handles it; Gunicorn doesn't)

**Fix**:
```python
import os
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'
```

---

### 4. `ALLOWED_HOSTS = []` — Django rejects ALL requests with DEBUG=False
**File**: `backend/backend/settings.py:9`
```python
ALLOWED_HOSTS = []
```
**Impact**: As soon as `DEBUG=False`, Django returns `400 Bad Request` for every request. Site completely down.  
**Fix**:
```python
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost').split(',')
# Example: DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

---

### 5. Insecure `SECRET_KEY` hardcoded in source code
**File**: `backend/backend/settings.py:5`
```python
SECRET_KEY = 'django-insecure-eq=q^%x9kk+ntdk!$&9=_lw8ba*2@l_bouc+q5acl(tt#@)0en'
```
**Impact**:
- Anyone who sees this repo can forge session cookies, CSRF tokens, and JWT signatures
- This key is the SIGNING_KEY for JWT — all tokens can be forged
- Prefix `django-insecure-` is Django's own warning that this key is unsafe

**Fix**:
```python
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError('DJANGO_SECRET_KEY environment variable not set')
```
Generate a new key: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

---

### 6. Database credentials hardcoded in source code
**File**: `backend/backend/settings.py:107-115`
```python
DATABASES = {
    'default': {
        'NAME': 'portfolio_db',
        'USER': 'root',
        'PASSWORD': "",    # ← root with no password
        'HOST': 'localhost',
    }
}
```
**Impact**: Database credentials in source code. Production DB will have a real password — this config won't connect.  
**Fix**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'portfolio_db'),
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}
```

---

### 7. Media files not served in production
**File**: `backend/backend/urls.py:13-14`
```python
if settings.DEBUG:   # ← media files ONLY served in dev
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```
**Impact**: All uploaded images (course icons, gallery, project thumbnails) return 404 in production.  
**Fix options**:
- **Nginx**: Configure Nginx to serve `/media/` directly from `MEDIA_ROOT`
- **WhiteNoise**: For static only (not media — WhiteNoise doesn't handle user uploads)
- **Cloud storage**: Use AWS S3 + `django-storages` (recommended for production)

---

### 8. No static file serving setup for production
**File**: `backend/backend/settings.py`  
Missing: `STATIC_ROOT`, whitenoise middleware, `collectstatic` in deployment script.  
**Impact**: Admin panel CSS/JS broken. Any static assets Django needs to serve are missing.  
**Fix**:
```python
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```
Add `whitenoise.middleware.WhiteNoiseMiddleware` to MIDDLEWARE after SecurityMiddleware.  
Run `python manage.py collectstatic` in deployment pipeline.

---

### 9. `CORS_ALLOW_ALL_ORIGINS = True`
**File**: `backend/backend/settings.py:49`
```python
CORS_ALLOW_ALL_ORIGINS = True  # any website can call your API
```
**Impact**: Any malicious website can make authenticated requests to your API using a victim's browser.  
**Fix**:
```python
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend-domain.com',
    'https://aman-0402.github.io',
]
```

---

## 🟠 HIGH — Security & Auth Issues

### 10. JWT tokens never validated for expiry on page load
**File**: `client/src/context/AuthContext.jsx:16-23`
```js
const decoded = jwtDecode(savedToken)   // decodes but never checks exp
setToken(savedToken)
setUser(decoded)
```
**Impact**: An expired token is treated as valid until the first API call returns 401. Users see a flash of authenticated UI before being kicked out.  
**Fix**: Check `decoded.exp` before trusting the token:
```js
const decoded = jwtDecode(savedToken)
if (decoded.exp * 1000 < Date.now()) {
  localStorage.removeItem('auth_token')
} else {
  setToken(savedToken); setUser(decoded)
}
```

---

### 11. No JWT token refresh — users silently logged out after 24h
**File**: `client/src/services/api.js` / `AuthContext.jsx`  
**Impact**: JWT lifetime is 1 day (`ACCESS_TOKEN_LIFETIME: timedelta(days=1)`). After 24h, every API call fails with 401 and the user is force-redirected to `/login` with no warning.  
**Fix**: In the 401 interceptor, attempt token refresh before logging out. Backend already has `/api/auth/refresh/` endpoint.

---

### 12. Password change doesn't invalidate old JWT token
**File**: `backend/portfolio/views.py` — `change_password` view  
**Impact**: After changing password, the old JWT token remains valid for up to 24h. If an attacker stole the token, they keep access even after password change.  
**Fix**: Add a `password_changed_at` timestamp to `UserProfile`. Validate in JWT authentication that the token was issued after the last password change.

---

### 13. `window.location.href = '/login'` breaks on subpath deployments
**File**: `client/src/services/api.js:26`
```js
window.location.href = '/login'  // hardcoded path
```
**Impact**: If the app is served at `/aman.ai/`, this redirects to `/login` (404) instead of `/aman.ai/login`.  
Also: full page reload loses React Router state.  
**Fix**: Use `import.meta.env.BASE_URL + 'login'` or trigger logout through React Router's `navigate('/login')`.

---

### 14. No rate limiting on login endpoint
**File**: `backend/portfolio/urls.py` / `views.py`  
**Impact**: Brute-force attacks on `/api/auth/login/` — unlimited attempts, no lockout, no captcha.  
**Fix**: Add `django-ratelimit` or throttling in DRF:
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'anon': '10/min'},
}
```

---

### 15. JWT stored in `localStorage` — XSS vulnerable
**File**: `client/src/context/AuthContext.jsx:28`  
**Impact**: Any XSS injection can steal the JWT token and impersonate the user. `localStorage` is accessible from JavaScript.  
**Note**: Changing to HttpOnly cookies requires backend changes (cookie-based JWT). This is a known trade-off for SPAs. At minimum, ensure no user-generated content is rendered without sanitization.

---

## 🟡 MEDIUM — Functionality Bugs in Production

### 16. No HTTPS enforcement settings
**File**: `backend/backend/settings.py`  
Missing:
```python
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```
**Impact**: Site can be served over plain HTTP. Session cookies and JWTs transmitted in clear text.

---

### 17. No Django `LOGGING` configuration
**File**: `backend/backend/settings.py`  
**Impact**: Production errors (500s, exceptions, failed DB queries) are silently swallowed. No way to diagnose production issues without logs.  
**Fix**: Add logging to file or use a service like Sentry.

---

### 18. `FILE_UPLOAD_MAX_MEMORY_SIZE = 1MB` too small
**File**: `backend/backend/settings.py:150-151`  
**Impact**: Course image uploads fail silently if image > 1MB. Most phone photos are 3–8MB.  
**Fix**: Raise limit or add frontend validation to compress/resize before upload:
```python
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
```

---

### 19. No React error boundary
**File**: `client/src/App.jsx` and all page components  
**Impact**: If any component throws (e.g., API returns unexpected shape, `null` property access), the entire app shows a blank white screen with no message.  
**Fix**: Wrap `RouterProvider` in an `<ErrorBoundary>` component that shows a friendly error page.

---

### 20. `EMOJI_RE` regex compiled on every render in ServicesPage
**File**: `client/src/pages/ServicesPage.jsx`  
```jsx
{svc.icon && /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(svc.icon)
```
**Impact**: Regex compiled per service card per render. Minor performance hit.  
**Fix**: Move regex to module scope (already done in `ServicePeekCard.jsx` — apply same pattern to `ServicesPage.jsx` and `StudentServicesPage.jsx`).

---

### 21. Particle canvas may crash on low-end mobile / iOS Safari
**File**: `client/src/pages/HomePage.jsx` — `ParticleCanvas`  
**Impact**: 200 particles + twinkling + proximity detection + 5 constellations running at 60fps on a budget phone causes lag or browser tab crash. iOS Safari has stricter canvas memory limits.  
**Fix**: Detect `navigator.hardwareConcurrency` or screen size and reduce `N` on mobile:
```js
const N = window.innerWidth < 768 ? 80 : 200
```

---

### 22. No `@shared/` alias in this project (CLAUDE.md reference)
**File**: `CLAUDE.md` mentions `@shared/` alias for `shared/`, but `vite.config.js` has no such alias.  
**Impact**: Any future import using `@shared/` will fail at build time.

---

## 🔵 LOW — Configuration & Deployment

### 23. No `.env.example` files
**Files**: Neither `client/` nor `backend/` have `.env.example`  
**Impact**: New deployments don't know what env vars are required. Easy to forget `VITE_API_URL`, `DJANGO_SECRET_KEY`, `DB_PASSWORD`, etc.  
**Fix**: Create `client/.env.example` and `backend/.env.example` documenting all required vars.

---

### 24. No `requirements.txt` or `Pipfile` visible in repo root
**Impact**: Deployment to a fresh server has no way to know which Python packages to install (gunicorn, whitenoise, mysqlclient, corsheaders, etc.).  
**Fix**: Ensure `backend/requirements.txt` is committed and up to date.

---

### 25. Google Fonts loaded from CDN — blocked in China / strict networks
**File**: `client/index.html` (Google Fonts `<link>` tags)  
**Impact**: In countries where Google is blocked, fonts don't load. Layout shifts occur, DM Sans/Poppins fall back to system fonts.  
**Fix**: Self-host fonts using `fontsource` npm packages or include in `public/`.

---

### 26. No 404 fallback config for SPA on backend server
**Impact**: If users navigate directly to `/student/courses` or `/dashboard/ebooks` (not via React Router link), the server returns 404 because these aren't real server routes.  
**Fix**: Configure the web server to serve `index.html` for all non-API routes:
- **Nginx**: `try_files $uri $uri/ /index.html;`
- **Apache**: `FallbackResource /index.html` in `.htaccess`
- The repo has `client/public/404.html` which partly handles GitHub Pages, but not a real server.

---

### 27. `ACCESS_TOKEN_LIFETIME: timedelta(days=1)` too long
**File**: `backend/backend/settings.py:71`  
**Impact**: Stolen tokens are valid for 24h. Industry standard for access tokens is 15–60 minutes with auto-refresh.  
**Fix**: Shorten to 15–60 minutes and implement refresh flow (see issue #11).

---

## ✅ Pre-Deployment Checklist

### Backend
- [ ] Set `DEBUG=False` via env var
- [ ] Set strong `SECRET_KEY` via env var (generate new one)
- [ ] Set `ALLOWED_HOSTS` to production domain
- [ ] Set `CORS_ALLOWED_ORIGINS` to frontend domain only
- [ ] Move all DB credentials to env vars
- [ ] Add `STATIC_ROOT` + install WhiteNoise
- [ ] Run `python manage.py collectstatic`
- [ ] Configure Nginx/Apache to serve `/media/` from `MEDIA_ROOT`
- [ ] Add HTTPS security headers
- [ ] Add `LOGGING` config or Sentry integration
- [ ] Run with Gunicorn (`gunicorn backend.wsgi:application`)
- [ ] Add rate limiting to auth endpoints
- [ ] Raise `FILE_UPLOAD_MAX_MEMORY_SIZE` to 10MB

### Frontend
- [ ] Create `client/.env.production` with `VITE_API_URL=https://your-api-domain.com`
- [ ] Verify `imageUrl.js` uses the same env var name as `api.js`
- [ ] Fix `window.location.href = '/login'` → use base-aware redirect
- [ ] Add token expiry check in `AuthContext.jsx`
- [ ] Add React error boundary in `App.jsx`
- [ ] Reduce particle count on mobile (`N = 80` for small screens)
- [ ] Run `npm run build` and test the `dist/` folder locally with `npx serve dist`

### Infrastructure
- [ ] HTTPS/SSL certificate (Let's Encrypt)
- [ ] Nginx reverse proxy: port 80/443 → Gunicorn
- [ ] Nginx: `try_files $uri /index.html` for SPA fallback
- [ ] Nginx: serve `/media/` from Django MEDIA_ROOT
- [ ] Nginx: serve `/static/` from Django STATIC_ROOT
- [ ] Create `.env.example` for both client and backend

---

## 📊 Risk Summary

| Severity | Count | Examples |
|----------|-------|---------|
| 🔴 Critical | 9 | Hardcoded localhost, DEBUG=True, empty ALLOWED_HOSTS, exposed SECRET_KEY, no media serving |
| 🟠 High | 6 | No token expiry check, no refresh, no rate limiting, CORS open |
| 🟡 Medium | 6 | No HTTPS headers, no error boundary, 1MB upload limit, mobile canvas crash |
| 🔵 Low | 5 | No .env.example, no requirements.txt, no SPA fallback config |

**Bottom line**: The 9 critical issues will cause a complete production outage or security breach. Fix those before anything else.

---

**Last audited by**: Claude (automated tester pass)  
**Date**: June 2026
