import React, { useEffect, useState } from 'react';
import axios from 'axios';
import migrateLocalStorageData from './MigrateLocalstorage'
import { Form, Link, NavLink, redirect } from 'react-router-dom';
import GoogleAd from './GoogleAd';

export default function App() {

  const [posts, setPosts] = useState([]);
  let [comment, setComment] = useState(() => {
    let info = localStorage.getItem('toggle')
    return info ? JSON.parse(info) : {}
  })

  useEffect(() => {
    localStorage.setItem('toggle', JSON.stringify(comment))
  }, [comment]);

  const toggleComment = (postId) => {
    setComment((prevState) => ({
      ...prevState,
      [postId]: { ...prevState[postId], visible: !prevState[postId]?.visible },
    }));
  };

  const toggleLike = async (postId, e) => {
    e.preventDefault()
    let ID = JSON.parse(localStorage.getItem('profiles'))
    console.log(ID)
    await axios.get('https://new-create-check.onrender.com/posts')
    .then((response) => {
      response.data.map((user) => {
        if (user._id === postId) {
          if (user.likedUsers.length === 0 || !user.likedUsers.includes(ID)) {
            axios.post(`https://new-create-check.onrender.com/posts/${postId}/like`, {ID})
            .then((res) => {
              setPosts((prevPosts) => prevPosts.map(post =>
                post._id === postId ? {...post, likes: res.data.likes} : post
              ))
            })
            .catch((error) => console.error(error))
          }
          else if (user.likedUsers.includes(ID)) {
            axios.post(`https://new-create-check.onrender.com/posts/${postId}/dislike`, {ID})
            .then((res) => {
              console.log(response.data)
              setPosts((prevPosts) => prevPosts.map(post =>
                post._id === postId ? {...post, likes: res.data.likes} : post
              ))
            })
            .catch((error) => console.error(error))
          }
        }
      })
    })
    .catch(error => console.error(error))
    /*
    await axios.post(`https://new-create-check.onrender.com/posts/${postId}/like`, {ID})
    .then((response) => {
      let userAlreadyLiked;
      if (response.data.userlikes.includes(ID)) {
        userAlreadyLiked = true
      }
      else {
        userAlreadyLiked = false
      }
      console.log(userAlreadyLiked)
      console.log(response.data)
      if (!userAlreadyLiked) {
        setPosts((prevPosts) => prevPosts.map(post =>
          post._id === postId ? {...post, likes: response.data.likes} : post
        ))
      }
      else if (userAlreadyLiked) {
        axios.post(`https://new-create-check.onrender.com/posts/${postId}/dislike`, {ID})
        .then((response) => {
          console.log(response.data)
          setPosts((prevPosts) => prevPosts.map(post =>
            post._id === postId ? {...post, likes: response.data.likes} : post
          ))
        })
        .catch((error) => console.error(error))
      }
    })
    .catch((error) => console.error(error))
    */
  }

  const handleCommentChange = (postId, value) => {
    setComment((prevState) => ({
      ...prevState,
      [postId]: { ...prevState[postId], text: value },
    }));
  };

  const handleSubmit = (postId, e) => {
    e.preventDefault();
    const commentText = comment[postId]?.text;
    if (commentText) {
      axios.post(`https://new-create-check.onrender.com/posts/${postId}/comments`, {comment: commentText})
        .then(() => {
          setPosts((prevPosts) => prevPosts.map(post =>
            post._id === postId ? { ...post, comments: [...post.comments, {text: commentText}] } : post
          ));
          setComment((prevState) => ({
            ...prevState,
            [postId]: { visible: false, text: '' },
          }));
        })
        .catch((error) => console.error('Error posting comment:', error));
    }
  };

  useEffect(() => {
    migrateLocalStorageData();
    console.log("getting data")
    axios.get('https://new-create-check.onrender.com/posts')
      .then(response => setPosts(response.data))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  let [search, setSearch] = useState('')

  console.log(search)

  function Search() {
    let keywords = search.split(' ');
    let matches;
    let element;
    posts.forEach((post) => {
      matches = keywords.some(keyword => post.title.includes(keyword.toLowerCase()) || post.content.includes(keyword.toLowerCase()) || post.author.includes(keyword.toLowerCase()))
      if (search !== '' && matches) {
        element = document.getElementById(`${post._id}`);
        element.style.display = 'block';
      }
      else if (search !== '' && !matches) {
        element = document.getElementById(`${post._id}`);
        element.style.display = 'none';
      }
      else {
        element = document.getElementById(`${post._id}`)
        element.style.display = 'block';
      }
    })
  }

  useEffect(() => {
    if (search !== '') {
      let keywords = search.split(' ');
      let matches;
      let element;
      posts.forEach((post) => {
        matches = keywords.some(keyword => post.title.includes(keyword.toLowerCase()) || post.content.includes(keyword.toLowerCase()) || post.author.includes(keyword.toLowerCase()))
        if (search !== '' && matches) {
          element = document.getElementById(`${post._id}`);
          element.style.display = 'block';
        }
        else if (search !== '' && !matches) {
          element = document.getElementById(`${post._id}`);
          element.style.display = 'none';
        }
        else {
          element = document.getElementById(`${post._id}`)
          element.style.display = 'block';
        }
      })
    }
    else if (search === '') {
      posts.forEach((post) => {
        document.getElementById(`${post._id}`).style.display = 'block'
      })
    }
  })


  console.log(posts, comment);

  return (
    <div>
      <h1>Blog Posts</h1>
      <input id='search' type="search" placeholder="Search by Title, Content, or Author" value={search} onChange={(e) => setSearch(e.target.value)}></input>
      <button onClick={Search}>Search</button>
      {
        posts.length !== 0
        ?
        <ul>
          {posts.map(post => (
            <li key={post._id} id={post._id}>
              <Link to={post.user._id.toString()}>
                <h1>{post.user.username}</h1>
              </Link>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <p>{post.formattedDate}</p>
              {post.comments && post.comments.map((comment, index) => (
                <p key={index}>{comment.text}</p>
              ))}
              <p>Likes: {post.likes}</p>
              {
              !comment[post._id]?.visible
              ?
              <div>
                <button onClick={() => toggleComment(post._id)} id={post.id}>Comment</button>
                <button onClick={(e) => toggleLike(post._id, e)}>Like</button>
              </div>
              :
              <form method='post' onSubmit={(e) => handleSubmit(post._id, e)}>
                <label>
                  <span>Comment</span>
                  <textarea value={comment[post._id]?.text || ''} onChange={(e) => handleCommentChange(post._id, e.target.value)}/>
                </label>
                <button type='submit'>Post</button>
              </form>
            }
            <GoogleAd />
            </li>
            ))}
        </ul>
        :
        <div>No blogs Posted 🤯</div>}
    </div>
  );
}

