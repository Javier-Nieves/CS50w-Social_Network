from email.policy import default
from unittest.util import _MAX_LENGTH
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Posts(models.Model):
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="allUsersPosts")
    text = models.CharField(max_length = 500)
    image_url = models.CharField(max_length=300, blank = True)
    date = models.DateTimeField()
    likes = models.ManyToManyField(User, blank=True)

    def serialize(self):  # object.serialize() now will return a JSON object
        return {
            "id": self.id,
            "autor": self.autor.username,
            "text": self.text,
            "image": self.image_url,
            "date": self.date.strftime("%d.%b.%Y, %I:%M %p"),
            "likes": [user.username for user in self.likes.all()]
        }

    def __str__(self): 
        return f"{self.autor}: {self.text} on {self.date}"

class Comments(models.Model):
    post = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name="allPostComments")
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="allUsersComments")
    date = models.DateTimeField()
    text = models.CharField(max_length = 300)

class Followers(models.Model):
    person = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followWho")
    whoFollow = models.ManyToManyField(User, blank=True)
    
    def __str__(self): 
        return f"{self.person}"

#class Likes(models.Model):
#    post = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name="allLikes")
#    user = models.ForeignKey(User, on_delete=models.CASCADE)
#    like = models.BooleanField(default=False)
