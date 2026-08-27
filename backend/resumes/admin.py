from django.contrib import admin
from .models import Resume


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "template", "updated_at")
    list_filter = ("template",)
    search_fields = ("title", "owner__username")
