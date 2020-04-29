from django.shortcuts import render, redirect, get_list_or_404
from django.contrib import messages
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

    # if request.method == 'POST':
    #     u_form = UpdateUserForm(request.POST,   instance=request.user)
    #     p_form = UpdateProfileForm( request.POST,
    #                                 request.FILES,
    #                                 instance=request.user.profile)

    #     if u_form.is_valid() and p_form.is_valid():
    #         u_form.save()
    #         p_form.save()

    #         messages.success(request, 'Profile Successfully Updated!')

    #         return redirect('profile')

    # else:
    #     u_form = UpdateUserForm(instance=request.user)
    #     p_form = UpdateProfileForm(instance=request.user.profile)

    # params = {
    #     'userUpdateForm': u_form,
    #     'profileUpdateForm': p_form,
    #     'user_errors': u_form.errors,
    #     'profile_errors': p_form.errors
    # }
    user = get_list_or_404(User, username=user_name)
    user = user[0]

    top_posts = [user.post_set.all()[i] for i in range(10)]

    params = {
        'pro_user': user,
        'posts': top_posts
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