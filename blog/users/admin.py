from django.contrib import admin
from .models import Profile
from .models import FollowingUsers
from .models import FollowerUsers
# Register your models here.

admin.site.register(Profile)
admin.site.register(FollowerUsers)
admin.site.register(FollowingUsers)