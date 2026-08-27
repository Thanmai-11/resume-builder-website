from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from .views import RegisterView, ResumeViewSet

router = DefaultRouter()
router.register("resumes", ResumeViewSet, basename="resume")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", obtain_auth_token, name="login"),  # returns {"token": "..."}
    path("", include(router.urls)),
]
