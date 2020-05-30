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
        w, h = img.size

        # * squaring and resizing the image

        if w > 300 or h > 300 or w != h:

            if w != h:
                points = None
                if h < w:
                    diff = w - h
                    if diff == 1:
                        points = (0, 0, h, h)
                    else:
                        d0ver2 = diff/2
                        points = (d0ver2, 0, h + d0ver2, h)

                else:
                    points = (0, 0, w, w)

                img = img.crop(points)

            if w > 300 or h > 300:
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
