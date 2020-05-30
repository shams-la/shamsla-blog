from django.urls import path
from . import views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.PostListView.as_view(), name="blog-home"),
    path('post/<int:pk>/', views.PostDetailView.as_view(), name="post-detail"),
    path('post/<int:pk>/update/', views.PostUpdateView.as_view(), name="post-update"),
    path('post/<int:pk>/delete/', views.PostDeleteView.as_view(), name="post-delete"),
    path('posts/<author>/', views.UserPostsListView.as_view(), name="user-posts"),
    path('post/new/', views.PostCreateView.as_view(), name="post-create"),
    path('post/like/', views.likePost, name="post_like"),
    path('post/comment/', views.createComment, name="post_comment"),
    path('post/comment/reply/', views.postCommentReply, name="comment_reply"),
    path('post/comment/reply/get/', views.getReplies, name="get_replies"),
    path('post/comment/get/', views.getComments, name="get_comment"),
    path('post/comment/like/', views.likeComment, name="like_comment"),
]
