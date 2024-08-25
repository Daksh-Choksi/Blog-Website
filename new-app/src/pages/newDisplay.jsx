import axios from "axios"
import { useEffect, useState } from "react"

export default function newDisplay() {
  let id = JSON.parse(localStorage.getItem('newDisplay'))
  let [post, setPost] = useState(() => {
    let Post = localStorage.getItem('newDisplayPost')
    return Post ? JSON.parse(Post) : []
  })
  useEffect(() => {
    axios.get('https://new-create-check.onrender.com/posts')
    .then((response) => {
      response.data.map((user) => {
        if (user._id === id) {
          setPost([user])
        }
      })
    })
  }, [])
  console.log(post)
  return (
    <div>
      {
        post.map((user) => (
          <div key={user._id}>
            <h1>{user.title}</h1>
            <p>{user.content}</p>
            <p><em>by - {user.author}</em></p>
          </div>
        ))
      }
    </div>
  )
}