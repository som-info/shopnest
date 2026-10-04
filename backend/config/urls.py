"""Root URL configuration for the ShopNest API."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("store.urls")),
]
