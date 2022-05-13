from django.conf import settings
from django.conf.urls import include
from django.conf.urls.static import static
from django.urls import path

urlpatterns = [
    path('', include('app.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
