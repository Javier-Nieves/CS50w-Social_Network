
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("NewPost", views.indexPOST, name="indexPOST"),
    path("users/<str:profile>/post", views.profilePOST, name="profilePost"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Route
    path("posts/<int:post_id>", views.likePOST, name="like"),
    path("following", views.follow_view, name="following"),
    path("users/<str:profile>", views.profile_view, name="profile")
]
