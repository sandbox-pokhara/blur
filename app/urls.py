from django.urls import path

from .views import blur
from .views import index

urlpatterns = [
    path('', index, name='index'),
    path('blur/', blur, name='blur'),
]
