from django.utils.timezone import now as currentTime
from math import floor as smallFloat
from datetime import datetime, timezone
from json import loads as loadJson


def getTimeInSeconds(date_time):
    epoch = datetime.utcfromtimestamp(0).replace(tzinfo=timezone.utc)
    def getSeconds(dt): return (dt-epoch).total_seconds()

    return getSeconds(currentTime()) - getSeconds(date_time)


def secondsToString(seconds):

    def checkUnity(number, unit):
        number = smallFloat(number)

        return f'{number} {unit}' if number == 1 else f'{number} {unit}s'

    if seconds < 60:
        return checkUnity(seconds, 'second')
    elif seconds < 3600:
        return checkUnity(seconds / 60, 'minute')
    elif seconds < 86400:
        return checkUnity(seconds / 3600, 'hour')
    elif seconds < 604800:
        return checkUnity(seconds / 86400, 'day')
    elif seconds < 2628000:
        return checkUnity(seconds / 604800, 'week')
    elif seconds < 31540000:
        return checkUnity(seconds / 2628000, 'month')
    else:
        return checkUnity(seconds / 31540000, 'year')


def getCommentTime(date_time):
    return secondsToString(getTimeInSeconds(date_time))


def getLoadedJson(body, *args):
    print(args)
    try:
        req_body = loadJson(body)
        new_args = []
        for arg in args:
            new_arg = req_body[arg[0]]
            for fn in arg[1:]:
                new_arg = fn(new_arg)

                if new_arg == None:  # return None in a function if to get False
                    return False

            new_args.append(new_arg)

        print(new_args)
        return req_body, *new_args
    except:
        return False


def checkGetLike(cmt, user):
    """
    returning the values based on, is the user has liked or disliked the comment
    --
    11: like-true
    01: dislike-true
    0: like&dislike-false
    """
    if cmt.likes.filter(pk=user.pk).exists():
        return '11'
    elif cmt.dislikes.filter(pk=user.pk).exists():
        return '01'
    return '0'


def getRefinedCmts(objs, user=None, reps_length=True, get_replies=False):
    comments = []

    for cmt in objs:
        obj = {
            'id': cmt.id,
            'name': cmt.user.username,
            'img': cmt.user.profile.image.url,
            'cmt': cmt.body,
            'time': getCommentTime(cmt.created),
            'nlike': cmt.likes.all().count()
        }
        if user:
            obj['like'] = checkGetLike(cmt, user)

        if reps_length:
            # * if the length of replies is required
            obj['reps_len'] = getRepsLength(cmt.comment_replies.all())

        if get_replies:
            # * if the replies of the comment requires more deeper and deeper
            obj['replies'] = getRefinedCmts(cmt.comment_replies.all(
            ), user, reps_length=reps_length, get_replies=get_replies)

        comments.append(obj)

    return comments


def getRepsLength(replies, length=None):

    if not length:
        length = len(replies)

    for reply in replies:
        deep = reply.comment_replies.all()
        deep_len = len(deep)
        if deep_len > 0:
            length += getRepsLength(deep, length=deep_len)

    return length


def getBetterReplies(replies):
    new_replies = []

    def refineReplies(replies, parent_name=None):
        """
        parent_name is just the name of the user who replied to a reply [ e.g. reply(user:shams) -> @john no you are wrong ] here:: shams is replying to john that 'no you are wrong' | where john's comment/reply is already a reply.

        and the parent_name will be added to the second[or upto second] replies.
        e.g. burak(main_comment) -> john(1st reply) -> shams(2nd reply [ here john will be added at the start -- @john reply...]) -> and so for more deeper replies ...
        """

        for reply in replies:
            deeper_replies = reply['replies']

            if parent_name:
                reply['cmt'] = [parent_name, reply['cmt']]
            del reply['replies']

            if len(deeper_replies):
                refineReplies(deeper_replies, reply['name'])

            new_replies.append(reply)

    refineReplies(replies)

    return new_replies
