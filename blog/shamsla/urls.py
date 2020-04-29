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
    path('post/new/', views.PostCreateView.as_view(), name="post-create")
    # path('post/new/', views.createPost, name="post-create")
]