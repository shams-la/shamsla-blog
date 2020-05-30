from django import template

register = template.Library()


@register.filter(name="add_class")
def addClass(value, arg):
    return value.as_widget(attrs={'class': arg})


@register.filter(name='add_attr')
def add_attr(value, args):
    args = [[a for a in arg.split(',')] for arg in args.split(';;')]

    return value.as_widget(attrs={arg[0]: arg[1] for arg in args})


@register.filter(name="split_by_n")
def split_by_n(value, split_by='\n'):
    return value.split(split_by)


@register.filter(name="check_post_like")
def check_post_like(value, pk):
    return value.likes.filter(pk=pk).exists()


@register.filter(name="check_following")
def check_following(value, user):
    return value.profile.followings.filter(user=user).exists()


@register.filter(name="splitText")
def splitText(value, arg):
    if len(value) > arg:
        return value[:arg] + " ..."
    return value


@register.filter(name="checkReply")
def checkReply(value):
    if len(value.comment_replies.all()) > 0:
        return True
    return False


@register.filter(name="getReplies")
def getReplies(value):
    return value.comment_replies.all()


@register.filter(name="printIt")
def printIt(value):
    print(value)
    return value


@register.filter(name="replaceGlobal")
def replaceGlobal(value, arg):
    arg = eval(arg)
    return value.replace(arg[0], arg[1])
