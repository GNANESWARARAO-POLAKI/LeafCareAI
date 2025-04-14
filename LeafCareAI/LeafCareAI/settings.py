from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

db_url=os.getenv("DB_URL")
email=os.getenv("EMAIL")
password=os.getenv("EMAIL_PASSWORD")
django_secret_key=os.getenv("DJANGO_SECRET_KEY")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = django_secret_key or 'xyz' # replace with your key 

DEBUG = True # Set to False in production

ALLOWED_HOSTS = ['*']


# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions', 
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'backend',
    'corsheaders',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',  # Ensures session works
    'corsheaders.middleware.CorsMiddleware',  # Ensure CORS is before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static file compression'

    # not used in this project development.

    # 'django.middleware.security.SecurityMiddleware',  # Security middleware
    # 'django.middleware.csrf.CsrfViewMiddleware',  # CSRF protection
]

ROOT_URLCONF = 'LeafCareAI.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ], 
        },
    },
]

WSGI_APPLICATION = 'LeafCareAI.wsgi.application'

# ============================== DB CONFIGURATION ===================== #

# local sqlite3 database 

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

## for the online db ,i used neon.tech db 

# import dj_database_url
# DATABASES = {
#     'default': dj_database_url.config(
#         default=db_url,
#         conn_max_age=600,  
#     )
# }

AUTH_USER_MODEL = "backend.User"



# Static files settings
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files settings but meda files are not used in this project
MEDIA_URL = "/media/"  # URL to access media files
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ==============================
# 🔥 SESSION & CORS CONFIGURATION
# ==============================

# Allow React frontend to make authenticated requests

SESSION_ENGINE = "django.contrib.sessions.backends.db"

# Ensure session cookies work across domains
SESSION_COOKIE_NAME = "sessionid"
SESSION_COOKIE_HTTPONLY = True  # Prevents JavaScript from reading it
# SESSION_COOKIE_SAMESITE = None  # Allows cross-origin requests
SESSION_COOKIE_SECURE = False  # Set True if using HTTPS
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Keep session active

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # React
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# JWT Settings (Token Expiry)
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Tokens valid for 1 day
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # Refresh tokens valid for 7 days
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# ==============================


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587  # Use 465 if you're switching to SSL
EMAIL_USE_TLS = True  # Use EMAIL_USE_SSL = True if EMAIL_PORT = 465

EMAIL_HOST_USER = email
EMAIL_HOST_PASSWORD = password  # Your App Password
EMAIL_FROM = 'Team LeafCare'
