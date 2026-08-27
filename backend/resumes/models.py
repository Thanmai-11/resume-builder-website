from django.conf import settings
from django.db import models


class Resume(models.Model):
    """A single saved resume belonging to one user.

    The full form payload (personal info, summary, education rows,
    experience rows, skills) is stored as JSON so the frontend schema
    can evolve without a migration every time a field is added.
    """

    TEMPLATE_CHOICES = [
        ("classic", "Classic"),
        ("modern", "Modern"),
        ("compact", "Compact"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="resumes", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=120, default="Untitled Resume")
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default="modern")
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.owner.username})"
