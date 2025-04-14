from django.urls import path, re_path,include
from backend.views import index  # Import the view
from django.http import HttpResponseNotFound
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
# Custom 404 page


urlpatterns = [
    # Serve React app for frontend routes
    
    path('backend/',include('backend.urls')),
    path("google0f5f7fa32431585f.html", TemplateView.as_view(template_name="google0f5f7fa32431585f.html"), name="google_verify"),
    re_path(r"^(?!static/|media/|admin/|backend/|google0f5f7fa32431585f.html).*", index),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)