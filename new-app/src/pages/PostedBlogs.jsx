import axios from "axios"
import { useEffect, useState } from "react"
import migrateLocalStorageData from "./MigrateLocalstorage"
import SocialShare from "./SharingBlogs"

export default function PostedBlogs() {
  let loginInfo = JSON.parse(localStorage.getItem('credentials'));
  let [postedBlogs, setPostedBlogs] = useState([])
  let [toggle, setToggle] = useState(() => {
    let info = localStorage.getItem('toggle')
    return info ? JSON.parse(info) : false
  })

  let post = JSON.parse(localStorage.getItem('stateCheck'))
  console.log(post)

  useEffect(() => {
    localStorage.setItem('toggle', JSON.stringify(toggle))
  }, [toggle])

  function deleteBlog(postId) {
    let ID = JSON.parse(localStorage.getItem('profiles'))
    axios.post(`http://localhost:5000/posts/${ID}/keepFollowers1`)
    .then(response => console.log(response.data))
    .catch(error => console.error(error))
    let save= []
    console.log(postId);
    axios.delete('http://localhost:5000/posts', {
      data: { id: postId, Id: ID }
    })
    .then(response => {
      // Optionally, fetch updated posts from the server after deletion
      axios.get('http://localhost:5000/posts')
        .then(response => {
          post.map((posts) => {
            response.data.map((res) => {
              if (Number(res.id) === Number(posts.id) && res.author === posts.author && res.title === posts.title && res.content === posts.content && res.secondid === posts.secondid && res.email === loginInfo.email && res.password === loginInfo.password) {
                save.push(res)
              }
            })
          })
          let uniqueSave = []
          save.every((element) => {
            if (!uniqueSave.includes(element)) {
              uniqueSave.push(element)
            }
            return true;
          })
          setPostedBlogs(uniqueSave)
          
        })
        .catch(error => console.error('Error fetching posts:', error));
    })
    .catch(error => console.error('Error deleting post:', error));
  }

  async function check() {
    try {
      let idCheck = JSON.parse(localStorage.getItem('profiles'));
      console.log(idCheck);
  
      let [postsResponse, profilesResponse] = await Promise.all([
        axios.get('http://localhost:5000/posts'),
        axios.get('http://localhost:5000/profiles')
      ]);
  
      let posts = postsResponse.data;
      let profiles = profilesResponse.data;
      let save1 = [];
  
      profiles.forEach(profile => {
        if (profile._id === idCheck) {
          profile.postedBlogs.forEach(blog => {
            posts.forEach(post => {
              if (
                post.id === Number(blog.id) &&
                post.author === blog.author &&
                post.title === blog.title &&
                post.content === blog.content &&
                post.secondid === blog.secondid
              ) {
                save1.push(post);
              }
            });
          });
        }
      });
  
      console.log(save1);
  

      let uniqueSave = Array.from(new Set(save1.map(post => post.id)))
        .map(id => save1.find(post => post.id === id));
  
      console.log(uniqueSave);
      setPostedBlogs(uniqueSave);
    } catch (error) {
      console.error(error);
    }
  }
  

  useEffect(() => {
    let save = []
    migrateLocalStorageData();
    axios.get('http://localhost:5000/posts')
      .then(response => {
        console.log(response.data)
        post.map((posts) => {
          response.data.map((res) => {
            if (res.id === Number(posts.id) && res.author === posts.author && res.title === posts.title && res.content === posts.content && res.secondid === posts.secondid && res.email === loginInfo.email && res.password === loginInfo.password) {
              save.push(res)
            }
          })
        })
        console.log(save)
        if (save.length === 0) {
          check();
        }
        let uniqueSave = []
        save.every((element) => {
          if (!uniqueSave.includes(element)) {
            uniqueSave.push(element)
          }
          return true;
        })
        console.log(uniqueSave)
        setPostedBlogs(uniqueSave)
      })
      .catch(error => console.error('Error fetching posts:', error));
      localStorage.setItem('PostedBlogs', JSON.stringify(postedBlogs))
  }, []);

  useEffect(() => {
    if (postedBlogs.length === 0) {
      setToggle(true);
    }
    else {
      setToggle(false)
    }
  }, [postedBlogs])

  return (
    <div>
      {
      !toggle 
      ?
      postedBlogs.map(posts => (
        <div key={posts._id}>
        <h1>{posts.title}</h1>
        <p>{posts.content}</p>
        {posts.comments && posts.comments.map((comment, index) => (
          <p key={index}>Comments : {comment.text}</p>
        ))}
        <p>Likes: {posts.likes}</p>
        <button onClick={() => deleteBlog(posts._id)}>Delete the blog</button>
        <SocialShare url={window.location.href} title={posts.title} id={posts._id} />
        </div>
      ))
      :
      <p>No Blogs Posted Yet 😔</p>
      }
    </div>
  )
}