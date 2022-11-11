document.addEventListener('DOMContentLoaded', function() {
  
  user = document.querySelector('#username').value;
  document.querySelector('.post-button').style.animationPlayState = 'paused';

  // like or edit buttons are clicked
    document.addEventListener('click', event => {
      const tar = event.target;
      let ClName = tar.className;
      // look is the liked Post itself, not like btn
      const look = tar.parentElement;

      // "following" list activated 
      if (ClName.includes("fol-btn")) {
        followed_view();
      }
      // if username is selected
      if (ClName.includes('profile-btn')) {
        var profile = tar.value;
        profile_view(profile);
      }
      // follow btn name toggle
      if (ClName.includes('follow-btn')) {
        var folAct = document.querySelector("#fol-change").innerHTML;
        if (document.querySelector("#follow-btn").name === 'unfol-btn') {
          // time delay is necessary for form action in views.py 
          setTimeout(function(){
            document.querySelector("#follow-btn").name = "follow-btn";
            document.querySelector("#follow-btn").innerHTML = "Follow"; 
            document.querySelector("#fol-change").innerHTML = Number(folAct)-1;
          }, 100); 
        }
        else {
          setTimeout(function(){
            document.querySelector("#follow-btn").name = "unfol-btn";
            document.querySelector("#follow-btn").innerHTML = "Unfollow";
            document.querySelector("#fol-change").innerHTML = Number(folAct)+1;
          }, 100);
        }
      }

    // check if post was already liked by user
    try {
      id = look.parentElement.querySelector(".secret-number").value;;
    
      fetch(`/posts/${id}`)
      .then(response => response.json())
      .then(post4 => {

        // if class name is like-related
        if (ClName.includes("post-like")) {
          var liked = 0
          // array length in JS
          if (post4.likes.length != 0) {
              for (i in post4.likes) {
                  // post was already liked. old like means unlike
                  if (user === post4.likes[i]) {
                      liked = 1
                      fetch(`/posts/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            likes: -1
                            })
                        });
                        // decrease like counter
                        tar.value--;
                        tar.innerHTML = `&#9829 ${tar.value}`
                  }
              }
              }
              // no like from user or no likes at all
              if (liked === 0) {
                // new like from user
                  fetch(`/posts/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        likes: 1
                        })
                    });
                // increase like counter without reload
                tar.value++;
                tar.innerHTML = `&#10084 ${tar.value}`
                }
            }
  
      // edit post
      if (ClName.includes("post-edit-btn")) {
        // hide edit btn and old text, show textarea and Save btn

        look.parentElement.querySelector(".post-text").style.display = 'None';
        look.parentElement.querySelector(".post-edit-btn").style.display = 'None';
        look.parentElement.querySelector(".edit-container").style.display = 'block';
        look.parentElement.querySelector(".edit-container").innerHTML = `<textarea class="form-control" id="compose-body" autofocus required="required">${post4.text}</textarea>`;
        look.parentElement.querySelector(".save-btn").style.display = 'block';
      }

      // when save btn is clicked 
      if (ClName.includes("save-btn")) {
        edited = look.parentElement.querySelector(".form-control").value;
        // change post's body
        fetch(`/posts/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              text: edited
              })
          });
        look.parentElement.querySelector(".save-btn").style.display = 'none';
        look.parentElement.querySelector(".post-edit-btn").style.display = 'block';
        look.parentElement.querySelector(".edit-container").style.display = 'None';
        look.parentElement.querySelector(".post-text").style.display = 'block';
        look.parentElement.querySelector(".post-text").innerHTML = edited;
      }

      // delete btn is clicked
      if (ClName.includes("post-delete-btn")) {
        // send info to backend
        fetch(`/posts/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              image: "deletePost"
              })
          });
        // change frontend
        look.parentElement.style.animationPlayState = 'running';
        look.parentElement.querySelector('.post-text').style.animationPlayState = 'running';
        look.parentElement.addEventListener('animationend', () => {
          look.parentElement.remove();
        })
      }

      });
  } catch (error) {
    console.error("no id detected");
  }
  })

    // animating new post btn (!) with delay
    var postBtn = document.getElementById('postBtn');
    var delay = function (elem, callback) {
    var timeout = null;
    elem.onmouseover = function() {timeout = setTimeout(callback, 800)};
    elem.onmouseout = function() {clearTimeout(timeout);}
    };
    delay(document.querySelector("#new-post-id"), function() {
      if (postBtn.style.width != '99px') {
        postBtn.style.animationPlayState = 'running';
        postBtn.style.width = '99px';
        setTimeout(function(){
            postBtn.style.animationPlayState = 'paused';
        }, 1800);
      }
    });

    document.querySelector("#new-post-id").onfocus = function(){
      if (postBtn.style.width != '99px') {
          postBtn.style.animationPlayState = 'running';
          setTimeout(function(){
            postBtn.style.animationPlayState = 'paused';
        }, 1800);
      }
    };

    document.addEventListener('click', event => {
      const targ = event.target;
      let ClName2 = targ.className;
      if (ClName2 === "body") {
        if (postBtn.style.width === '99px') {
          console.log("yes");
          postBtn.style.width = '100px';
          postBtn.style.animationPlayState = 'running';
          setTimeout(function(){
            postBtn.style.animationPlayState = 'paused';
        }, 1799.9);
      }
      }
    })


})

function show_post(item) {
  const element = document.createElement('div');
  const text = `<div class="post-holder" id="inner-post-holder">
  <a href="/users/${item.autor}" class="invis-btn profile link" value="${item.autor}">${item.autor}</a>
  <input type="hidden" class="secret-number" disabled value="${item.id}">
  <div class="post-date"> ${item.date} </div> 
  <div class="edit-container"></div>
  <div class="post-text"> ${item.text} </div>`;

  if (item.likes.includes(user)) {
  element.innerHTML = text + `<button class="post-like" name="like-btn" value="${item.likes.length}">&#10084 ${item.likes.length}</button> </div>`; 
    }
  else {
    element.innerHTML = text + `<button class="post-like" name="like-btn" value="${item.likes.length}">&#9829 ${item.likes.length}</button> </div>`; 
    }
  document.querySelector('#follow-post-holder').append(element);
}

function followed_view() {
    document.querySelector("#title").innerHTML = "Followed";
    document.querySelector('#create-post-box').style.display = 'none'; 
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#pages').style.display = 'none';
    document.querySelector('#follow-post-holder').style.display = 'block';
    fetch(`/following`)
    .then(response => response.json())
    .then(posts => {
      posts.forEach(item => {
        show_post(item);
      });
    });
}


function profile_view(profile) {
  document.querySelector("#title").innerHTML = `${profile}`;
  document.querySelector('#create-post-box').style.display = 'none';
  document.querySelector('#all-posts').style.display = 'none';
  document.querySelector('#pages').style.display = 'none';
  document.querySelector('#profile-view').style.display = 'block';
  document.querySelector('#follow-post-holder').style.display = 'block';

  fetch(`/users/${profile}`)
    .then(response => response.json())
    .then(post => {
      post.posts.forEach(item => {
        if (user === profile) {
          document.querySelector("#follow-btn-container").style.display = 'none';
        }
        else {
          document.querySelector('#fol-form').action = `users/${profile}/post`;
          if (!post.followedPerson) {
            document.querySelector("#follow-btn").name = "follow-btn";
            document.querySelector("#follow-btn").innerHTML = "Follow";
          }
          else {
            document.querySelector("#follow-btn").name = "unfol-btn";
            document.querySelector("#follow-btn").innerHTML = "Unfollow";
          }
        }
        document.querySelector("#followers-counter").innerHTML = `Followers: <span id="fol-change">${post.followers}</span>&nbsp Following: ${post.following}`;
        show_post(item);
      });
    });

}