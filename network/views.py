import json
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from datetime import datetime

from .models import User, Posts, Followers

@require_POST
def indexPOST (request):
    # new post is created
    if request.POST.get("post-btn", None):
        autor = User.objects.get(username=request.user.username)
        text = request.POST.get("new-post")
        image_url = request.POST.get("image-url")
        date = datetime.now()
        Posts.objects.create(autor=autor, text=text, image_url=image_url, date=date)

    return HttpResponseRedirect(reverse("index"))


def index(request):
    posts_list = Posts.objects.all().order_by("-date")
    paginator = Paginator(posts_list, 10) # Show 10 posts per page.
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        'page_obj': page_obj
        })


def profile_view(request, profile):
    # all posts of selected user
    usersPosts = Posts.objects.filter(autor__username=profile).all().order_by("-date")

    exist, flc, wfc = [], 0, 0
    try:
        for i in Followers.objects.all():
            exist.append(i.whoFollow.all())
            # now exist will be a list of all users in Followers objects

        for j in exist:
            # counter will increase each time user apears in exist list
            if User.objects.get(username=profile) in j:
                flc += 1
    except:
        flc = 0

    try:
        folp = Followers.objects.get(person__username=profile).whoFollow.all()
        wfc = folp.count()
        if request.user in folp:
            q = True
        else:
            q = False
    except:
        wfc = 0
        q = False
    # !!!
    return JsonResponse({  
        "posts": [post.serialize() for post in usersPosts],
        "followers": wfc,
        "following": flc,
        "followedPerson": q
        }, safe = False, status=200)


# follow or unfollow user
@require_POST
def profilePOST (request, profile):
    if request.POST.get('follow-btn', None):
        exist = Followers.objects.filter(person__username=profile).values().first()
        # if Followers model already exists (someone already followed that user)
        if exist != None:
            Follower(request, profile, "add")
        # create model otherwise
        else:
            create_follow = Followers(person=User.objects.get(username=profile))
            create_follow.save()
            Follower(request, profile, "add")

    elif request.POST.get('unfol-btn', None):
        Follower(request, profile, "remove")

    return HttpResponse(status=204)


# API
@csrf_exempt
def likePOST(request, post_id):
    post4 = Posts.objects.get(pk=post_id)
    if request.method == "GET":
        return JsonResponse(post4.serialize())

    # Update likes
    elif request.method == "PUT":
        data = json.loads(request.body)

        if data.get("likes") == 1:
            post4.likes.add(request.user)

        if data.get("likes") == -1:
            post4.likes.remove(request.user)
    
        # if post is beeing deleted
        if data.get("image") == "deletePost":
            post4.delete()
            return HttpResponse(status=204)
        
        # if post is beeing edited 
        if data.get("text") != 0:
            if request.user.username == post4.autor:
                post4.text = data["text"]

        post4.save()
        return HttpResponse(status=204)  # 204 - No content. Site shouldn't navigate to URL

# API
def follow_view(request):
    # following button is pressed
    exi, k = [], 0
    foList = Followers.objects.filter(whoFollow = request.user).all()
    # exi will be the list of all people User follows
    for i in foList:
        exi.append(foList[k])
        k += 1
    # cool method for list condition inside Models
    posts_list = Posts.objects.filter(autor__username__in=exi).all().order_by("-date")
    return JsonResponse([post.serialize() for post in posts_list], safe=False, status=200)

# ---------Helpers functions

def Follower(request, person, action):
    # how to edit ManyToMany field. Get the needed model, create variable for it
    list_alter = Followers.objects.get(person__username=person)
    list_alter.save()
    # create a variable for the thing you want to insert to MtM field
    following = request.user
    following.save()
    if action == "add":
        # insert second var into the first var
        list_alter.whoFollow.add(following)
    elif action == "remove":
        list_alter.whoFollow.remove(following)

#_________________________________

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
