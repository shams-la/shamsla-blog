from django.shortcuts import render, redirect, get_list_or_404
from django.views.generic import ListView, DetailView, CreateView,UpdateView, DeleteView

from django.urls import reverse

from django.contrib import messages

from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
# from django.contrib.auth.decorators import login_required

from .models import Post

from django.contrib.auth.models import User

from .forms import PostCreateForm

# Create your views here.

# def index(req):
#     params = {
#         'posts': Post.objects.all()
#     }
#     return render(req,'shamsla/home.html', params)


class PostListView(ListView):
    model = Post
    context_object_name = 'posts'
    template_name = 'shamsla/home.html'
    ordering = ['date_posted']
    paginate_by = 10

class PostDetailView(DetailView):
    model = Post
    context_object_name = 'post'


class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ['title', 'content']

    def form_valid(self, form):
        form.instance.author = self.request.user

        return super().form_valid(form)

class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Post
    context_object_name = "post"
    template_name = "shamsla/post_update.html"
    fields = ['title', 'content']

    def form_valid(self, form):
        form.instance.author = self.request.user

        return super().form_valid(form)

    def test_func(self):
        post = self.get_object()

        if post.author == self.request.user:
            return True
        return False



class PostDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Post
    context_object_name = "post"
    template_name = "shamsla/post_delete.html"
    success_url = "/"

    def test_func(self):
        post = self.get_object()

        if post.author == self.request.user:
            return True
        return False



class UserPostsListView(ListView):
    model = Post
    context_object_name = "posts"
    template_name = "shamsla/user_posts.html"
    ordering = ["date_posted"]
    paginate_by  = 10

    def get_queryset(self):
        q_set = super(UserPostsListView, self).get_queryset()

        author_name = self.request.path.split('/')[-2]
        author = get_list_or_404(User, username=author_name)

        # filtering only the users posts
        q_set = q_set.filter(author=author[0])
        return q_set



# http://newsapi.org/v2/everything?q=programming&from=2020-03-27&sortBy=publishedAt&apiKey=7934bb8301094a61b7f655da53dc4878
# @login_required
# def createPost(request):

#     params = {}

#     if request.method == 'POST':
#         form = PostCreateForm(request.POST)

#         if form.is_valid():
#             ins = form.save(commit=False)
#             ins.author = request.user
#             ins.save()

#             messages.success(request, 'Post Created .')
#             return redirect(reverse('post-detail', kwargs={'pk': ins.id}))
    
#         else:
            
#             params['errors'] = form.errors
            

#     form = PostCreateForm()
#     params['form'] = form
    
#     return render(request, 'shamsla/post_create.html', params)
