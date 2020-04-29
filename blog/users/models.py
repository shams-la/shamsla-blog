from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

from PIL import Image

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    join_date = models.DateTimeField(default=timezone.now)
    image = models.ImageField(default='users/images/default.PNG', upload_to='profile_pics')

    def __str__(self):
        return self.user.username + ' Profile'

    def save(self, *args, **kwargs):

        super().save()

        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            img.thumbnail((300, 300))
            img.save(self.image.path)