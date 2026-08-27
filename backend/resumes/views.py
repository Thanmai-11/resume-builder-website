from django.http import HttpResponse
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import Resume
from .serializers import ResumeSerializer, RegisterSerializer
from .pdf import render_resume_pdf


class RegisterView(generics.CreateAPIView):
    """POST username/email/password -> creates a user and returns an auth token."""

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "username": user.username},
            status=status.HTTP_201_CREATED,
        )


class ResumeViewSet(viewsets.ModelViewSet):
    """Full CRUD for the logged-in user's own resumes, plus a PDF export action."""

    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["get"])
    def export_pdf(self, request, pk=None):
        resume = self.get_object()
        pdf_bytes = render_resume_pdf(resume.data)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        filename = f"{resume.title or 'resume'}.pdf".replace(" ", "_")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
