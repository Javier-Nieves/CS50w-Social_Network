from django.contrib import admin

from .models import User, Posts, Comments, Followers

admin.site.register(User)
admin.site.register(Posts)
admin.site.register(Comments)
admin.site.register(Followers)