from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseNotFound, JsonResponse
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .forms import UserRegistrationForm, UpdateProfileForm, UpdateUserForm
from json import loads as loadJson
from shamsla.custom_funcs import getLoadedJson


def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(
                request, f'Account Successfully Created For {username.title()}')

            return redirect('login')
        else:

            new_form = UserRegistrationForm()

            return render(request, 'users/userHandle/register.html', {'form': new_form, 'errors': [f"{name.title()}: {e}" for name, error in form.errors.items() for e in error]})
    else:
        form = UserRegistrationForm()
        return render(request, 'users/userHandle/register.html', {'form': form})


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
        'followers': followers
    }

    auth_user = request.user

    if auth_user.is_authenticated:
        params['follow_or_not'] = auth_user.profile.followings.filter(
            user=user).exists()

    return render(request, 'users/userProfile/profile.html', params)


@login_required
def userProfileChange(request):

    params = {}

    if request.method == 'POST':

        user_form = UpdateUserForm(request.POST, instance=request.user)
        profile_form = UpdateProfileForm(
            request.POST, request.FILES, instance=request.user.profile)

        if user_form.is_valid() and profile_form.is_valid():

            user_form.save()
            profile_form.save()

            messages.success(request, 'Profile Successfully Updated!')
            return redirect('profile-change')

        else:
            params['errors'] = {

                'user_errors': [f"{name.title()}: {e}" for name, error in user_form.errors.items() for e in error],
                'profile_errors': [f"{name.title()}: {e}" for name, error in profile_form.errors.items() for e in error]

            }

    user_form = UpdateUserForm(instance=request.user)
    profile_form = UpdateProfileForm(instance=request.user.profile)

    params['user_form'] = user_form
    params['profile_form'] = profile_form

    return render(request, 'users/userProfile/profile_change.html', params)


@login_required
def following(request):

    def status_404(): return JsonResponse({'status': 404})
    def status_200(): return JsonResponse({'status': 200})

    if request.method == 'POST':
        try:
            data, user_id, follow_type = getLoadedJson(
                request.body, ['uid', int], ['type', lambda t:t])
            # data = loadJson(request.body)
            # user_id = int(data['uid'])
            # # * it could be either follower/following
            # follow_type = data['type']
            print(user_id, follow_type, data)
        except:
            return status_404()

        req_user = request.user  # * profile of logged in user
        to_user = User.objects.filter(id=user_id)  # * user to follow/following

        if not to_user.exists():
            return status_404()
        else:
            to_user = to_user[0]

        # * checking that is the req_user following to_user
        to_user_check = req_user.profile.followings.filter(user=to_user)

        if follow_type == "follow" and to_user != req_user:
            if not to_user_check.exists():
                req_user.profile.followings.create(user=to_user)
                to_user.profile.followers.create(user=req_user)
                return status_200()

        elif follow_type == "unfollow" and to_user != request.user:
            # * checking that is the req_user following to_user or not

            if to_user_check.exists():
                to_user_check[0].delete()  # * deleting the req_user following
                # * deleting to_user follower[req_user]
                to_user.profile.followers.filter(user=req_user).delete()
                return status_200()

    return status_404()
