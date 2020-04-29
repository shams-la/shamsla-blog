from django import template

register = template.Library()

@register.filter(name="add_class")
def addClass(value, arg):
    return value.as_widget(attrs={'class': arg})

@register.filter(name='add_attr')
def add_attr(value, args):
    args = [[a for a in arg.split(',')] for arg in args.split(';;')]

    return value.as_widget(attrs={arg[0]:arg[1] for arg in args})

@register.filter(name="split_by_n")
def split_by_n(value, split_by='\n'):
    return value.split(split_by)
