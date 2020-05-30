from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseBadRequest, JsonResponse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required
from .models import Post, Comment
from django.contrib.auth.models import User
from .forms import PostCreateForm
from json import loads as loadJson
from .custom_funcs import getCommentTime, getLoadedJson, getRefinedCmts, getBetterReplies
from django.core.paginator import Paginator
import time
from django.views.decorators.csrf import csrf_exempt


class PostListView(ListView):
    model = Post
    context_object_name = 'posts'
    template_name = 'shamsla/home/home.html'
    ordering = ['date_posted']
    paginate_by = 10


class PostDetailView(DetailView):
    model = Post
    context_object_name = 'post'
    template_name = 'shamsla/postDetail/post_detail.html'

    # def get_context_data(self, **kwargs):
    #     context = super().get_context_data(**kwargs)

    #     post = context['object']  # * getting post object

    #     def cmts(obj=post.post_comments.all()): return [{'name': cmt.user.username, 'img': cmt.user.profile.image.url, 'c': cmt.body, 't': getCommentTime(
    #         cmt.created), 'replies': cmts(cmt.comment_replies.all())} for cmt in obj]

    #     context['comments'] = cmts

    #     return context


class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    fields = ['title', 'content']
    template_name = "shamsla/postCreate/post_create.html"

    def form_valid(self, form):
        form.instance.author = self.request.user

        return super().form_valid(form)


class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Post
    context_object_name = "post"
    template_name = "shamsla/postUpdate/post_update.html"
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
    template_name = "shamsla/postDelete/post_delete.html"
    success_url = "/"

    def test_func(self):
        post = self.get_object()

        if post.author == self.request.user:
            return True
        return False


class UserPostsListView(ListView):
    model = Post
    context_object_name = "posts"
    template_name = "shamsla/userPosts/user_posts.html"
    ordering = ["date_posted"]
    paginate_by = 10

    def get_queryset(self):
        q_set = super(UserPostsListView, self).get_queryset()

        author_name = self.request.path.split('/')[-2]
        author = get_object_or_404(User, username=author_name)

        # filtering only the users posts
        q_set = q_set.filter(author=author)
        return q_set


@login_required
def likePost(request):

    def status_404(): return JsonResponse({'status': 404})
    def status_200(): return JsonResponse({'status': 200})

    if request.method == 'POST':

        try:
            req_body, post_id = getLoadedJson(request.body, ['pid', int])
            # post_id = int(loadJson(request.body)['pid'])
        except:
            # if pid not exists or pid is not a number
            return status_404()

        user = request.user
        # if post not found
        post = Post.objects.filter(id=post_id)
        if not post.exists():
            return status_404()
        else:
            post = post[0]

        if post.likes.filter(pk=user.pk).exists():
            post.likes.remove(user)
        else:
            post.likes.add(user)

        return status_200()

    # if request is a /GET request
    return status_404()


@login_required
def createComment(request):

    def status_404(): return JsonResponse({'status': 404})
    def status_200(comment_id): return JsonResponse(
        {'status': 200, 'id': comment_id})

    if request.method == "POST":
        try:
            req_data, comment_text, post_id = getLoadedJson(
                request.body, ['body', lambda t:t], ['pid', int])

            comment_text = comment_text.strip()
            if len(comment_text) < 1:
                raise Exception()

            post = Post.objects.filter(id=post_id)
            user = User.objects.filter(username=request.user.username)

            if not post.exists() or not user.exists():
                return status_404()

            else:
                post = post[0]
                user = user[0]

            cmt = Comment.objects.create(
                post=post, user=user, body=comment_text)

            return status_200(cmt.id)

        except:
            return status_404()

    # if request is a /GET request
    return status_404()


@csrf_exempt
def getComments(request):
    def status_404(): return JsonResponse({'status': 404})
    def status_200(comments, has_next): return JsonResponse(
        {'status': 200, 'cmts': comments, 'hnext': has_next})

    if request.method == "POST":
        try:
            req_body, page_n, pid = getLoadedJson(
                request.body, ['page', int], ['pid', int])

            post = Post.objects.filter(id=pid)[0]
            cmts_list = post.post_comments.all()

            paginator = Paginator(cmts_list, 8)
            cmts = paginator.page(page_n)
            if request.user.is_authenticated:
                cmts_list = getRefinedCmts(cmts.object_list, request.user)
            else:
                cmts_list = getRefinedCmts(cmts.object_list)

            return status_200(cmts_list, has_next=cmts.has_next())

        except Exception as exp:
            print(exp)

    return status_404()


@csrf_exempt
def getReplies(request):
    def status_404(): return JsonResponse({'status': 404})
    def status_200(replies, has_next): return JsonResponse(
        {'status': 200, 'reps': replies, 'hnext': has_next})

    if request.method == "POST":
        try:
            req_body, comment_id, page_num = getLoadedJson(
                request.body, ['cid', int], ['pnum', int])

            comment = Comment.objects.filter(id=comment_id)

            if not comment.exists():
                return status_404()
            else:
                comment = comment[0]
            if request.user.is_authenticated:
                replies = getBetterReplies(getRefinedCmts(
                    comment.comment_replies.all(), request.user, reps_length=False, get_replies=True))
            else:
                replies = getBetterReplies(getRefinedCmts(
                    comment.comment_replies.all(), reps_length=False, get_replies=True))

            paginator = Paginator(replies, 8)
            reps_page = paginator.page(page_num)

            return status_200(reps_page.object_list, has_next=reps_page.has_next())

        except:
            pass

    return status_404()


@login_required
def postCommentReply(request):

    def status_404(): return JsonResponse({'status': 404})
    def status_200(comment_id): return JsonResponse(
        {'status': 200, 'id': comment_id})

    if request.method == "POST":
        try:
            req_body, comment_id, reply_text = getLoadedJson(
                request.body, ['cid', int], ['body', lambda t:t])

            comment = Comment.objects.filter(id=comment_id)
            user = User.objects.filter(username=request.user.username)

            if not comment.exists() or not user.exists():
                return status_404()
            else:
                comment = comment[0]
                user = user[0]

            reply = comment.comment_replies.create(user=user, body=reply_text)
            return status_200(reply.id)

        except:
            pass
    return status_404()


@login_required
def likeComment(request):
    def status_404(): return JsonResponse({'status': 404})
    def status_200(): return JsonResponse({'status': 200})

    if request.method == 'POST':
        req_body, comment_id, like_action, like_type = getLoadedJson(request.body, ['cid', int], [
            'action', int, lambda x: x if x in (0, 1) else None], ['type', int, lambda x: x if x in (0, 1) else None])

        # * like_type could 0|1 -- 0 -> dislike & 1 -> like
        # * like_action could 0|1 -- 0 -> remove & 1 -> add

        user = request.user
        comment = Comment.objects.filter(id=comment_id)

        if not comment.exists():
            return status_404()
        else:
            comment = comment[0]

        if like_type == 1:
            if comment.dislikes.filter(pk=user.pk).exists():
                comment.dislikes.remove(user)
        else:
            if comment.likes.filter(pk=user.pk).exists():
                comment.likes.remove(user)

        like_type = comment.likes if like_type == 1 else comment.dislikes
        like_action = like_type.add if like_action == 1 else like_type.remove

        like_action(user)

        return status_200()

    return status_404()
