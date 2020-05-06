from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

from PIL import Image

# Create your models here.


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    join_date = models.DateTimeField(default=timezone.now)
    image = models.ImageField(
        default='default/default.png', upload_to='profile_pics')

    def __str__(self):
        return self.user.username + ' Profile'

    def save(self, *args, **kwargs):

        super().save()

        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            img.thumbnail((300, 300))
            img.save(self.image.path)


class FollowingUsers(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="following_user")
    followings = models.ForeignKey(
        Profile, related_name="followings", on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.followings.user.username} follows {self.user.username}'


class FollowerUsers(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="follower_user")
    followers = models.ForeignKey(
        Profile, related_name="followers", on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.followers.user.username} followed by {self.user.username}'
