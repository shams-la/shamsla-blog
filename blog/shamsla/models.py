from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse

# Create your models here.


class Post(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="post_author")
    likes = models.ManyToManyField(User, related_name="likes", blank=True)

    def save(self, *args, **kwargs):
        self.title = self.title.title()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('post-detail', kwargs={'pk': self.pk})


class Comment(models.Model):
    post = models.ForeignKey(
        Post, related_name="post_comments", on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(
        User, related_name="comment_user", on_delete=models.CASCADE)
    body = models.TextField()
    likes = models.ManyToManyField(User, related_name="post_likes", blank=True)
    dislikes = models.ManyToManyField(
        User, related_name="post_dislikes", blank=True)
    replies = models.ForeignKey(
        "self", related_name="comment_replies", blank=True, null=True, on_delete=models.CASCADE)
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["created"]

    def __str__(self):
        try:
            return f"{self.user.username} commented on {self.post.title}"
        except:
            return f"{self.user.username} replied"


class CommentReply(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    replies = models.ForeignKey("self", on_delete=models.CASCADE)

# >>> from . import models
# Traceback (most recent call last):
#   File "<console>", line 1, in <module>
# KeyError: "'__name__' not in globals"
# >>> from shamsla.models import models
# >>> from shamsla.models import Post
# >>> from django.contrib.auth.models import User
# >>> Post.objects.all()
# <QuerySet []>
# >>> User.first()
# Traceback (most recent call last):
#   File "<console>", line 1, in <module>
# AttributeError: type object 'User' has no attribute 'first'
# >>> User.objects.first()
# <User: shamsla>
# >>> user = User.objects.first()
# >>> Post(title='Post 1', content='Post 1 Content', author=user).save()
# >>> Post.objects.all()
# <QuerySet [<Post: Post 1>]>
# >>> user.post_set.create(title='Post 1', content='Post 1 Content')
# <Post: Post 1>
# >>> Post.objects.all()
# <QuerySet [<Post: Post 1>, <Post: Post 1>]>
# >>>
