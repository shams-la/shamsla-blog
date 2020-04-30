from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseNotFound
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from django.contrib.auth.models import User

from .forms import UserRegistrationForm, UpdateProfileForm, UpdateUserForm

# Create your views here.

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account Successfully Created For {username.title()}')

            return redirect('login')
        else:

            new_form = UserRegistrationForm()

            return render(request, 'users/register.html', {'form': new_form, 'errors': [f"{name.title()}: {e}" for name, error in form.errors.items() for e in error]})    
    else:
        form = UserRegistrationForm()
        return render(request, 'users/register.html', {'form': form})



def profile(request, user_name):

    user = get_object_or_404(User, username=user_name)

    posts = user.post_author.all()
    posts = posts[:10] if len(posts) > 10 else posts

    followings = user.profile.followings.all().count()
    followers = user.profile.followers.all().count()

    total_posts = posts.count()

    params = {
        'pro_user': user,
        'posts': posts,
        'total_posts': total_posts,
        'followings': followings,
        'followers': followers,
        'follow_or_not': request.user.profile.followings.filter(user=user).exists()
    }

    return render(request, 'users/profile.html', params)



@login_required
def userProfileChange(request):

    params = {}

    if request.method == 'POST':

        user_form = UpdateUserForm(request.POST, instance=request.user)
        profile_form = UpdateProfileForm(request.POST, request.FILES, instance=request.user.profile)

        if user_form.is_valid() and profile_form.is_valid():
            
            user_form.save()
            profile_form.save()

            messages.success(request, 'Profile Successfully Updated!')
            return redirect('profile-change')

        else:
            params['errors'] = {

                'user_errors': [f"{name.title()}: {e}" for name, error  in user_form.errors.items() for e in error],
                'profile_errors': [f"{name.title()}: {e}" for name, error  in profile_form.errors.items() for e in error]
                
                }

    user_form = UpdateUserForm(instance=request.user)
    profile_form = UpdateProfileForm(instance=request.user.profile)

    params['user_form'] = user_form
    params['profile_form'] = profile_form

    return render(request, 'users/user_change.html', params)

@login_required
def followUser(request):
    if request.method == "POST":
        
        try:
            follow_id = request.POST.get('uid')
        except:
            return HttpResponseNotFound("Not Found")

        to_follow_user = get_object_or_404(User, id=follow_id)

        user = request.user.profile

        if to_follow_user != request.user and not user.followings.filter(user=to_follow_user).exists():

            user.followings.create(user=to_follow_user)
            to_follow_user.profile.followers.create(user=request.user)

            return redirect(reverse('profile', kwargs={"user_name": to_follow_user.username}))
        
    return HttpResponseNotFound("Not Found")

        
        
@login_required
def unfollowUser(request):
    if request.method == "POST":

        try:
            follow_id = request.POST.get('uid')
        except:
            return HttpResponseNotFound("Not Found")

        to_follow_user = get_object_or_404(User, id=follow_id)

        user = request.user.profile
        follow_user = user.followings.filter(user=to_follow_user)

        if to_follow_user != request.user and follow_user.exists():

            follow_user.delete()
            to_follow_user.profile.followers.filter(user=request.user).delete()

            return redirect(reverse('profile', kwargs={"user_name": to_follow_user.username}))
        
    return HttpResponseNotFound("Not Found")

        
