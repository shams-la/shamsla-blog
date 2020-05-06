from django.urls import path
from django.contrib.auth import views as authViews

from . import views


urlpatterns = [
    path('register/', views.register, name="register"),
    path('login/', authViews.LoginView.as_view(template_name='users/userHandle/login.html'), name="login"),
    path('logout/', authViews.LogoutView.as_view(
        template_name='users/userHandle/logout.html'), name="logout"),
    path('profile/<user_name>/', views.profile, name="profile"),
    path('author/change/', views.userProfileChange, name="profile-change"),
    path('following/', views.following, name="following")

]
