import axios from "axios"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import migrateLocalStorageData from "./MigrateLocalstorage"

export default function UserProfile() {
  let {id} = useParams()
  let [Posts, setPosts] = useState([])
  let [profile, setProfile] = useState([])
  let [username, setUsername] = useState('')
  let [bio, setBio] = useState('')
  let [profilepic, setProfilepic] = useState('')
  let [Id, setId] = useState()
  let [follow, setFollow] = useState(() => {
    let Follow = localStorage.getItem('follow')
    return Follow ? JSON.parse(Follow) : []
  })
  console.log(id)

  useEffect(() => {
    localStorage.setItem('follow', JSON.stringify(follow))
  }, [follow])

  useEffect(() => {
    migrateLocalStorageData();
    console.log("getting data")
    axios.get('https://new-create-check.onrender.com/posts')
      .then(response => setPosts(response.data))
      .catch(error => console.error('Error fetching posts:', error));
  }, []);
  console.log(Posts, profile)
  useEffect(() => {
    axios.get('https://new-create-check.onrender.com/profiles')
    .then(response => setProfile(response.data))
  }, [])
  useEffect(() => {
    Posts.map((post) => {
      profile.map((profiles) => {
        if (id === profiles._id) {
          setProfilepic(profiles.profilepic)
          setUsername(profiles.username)
          setBio(profiles.bio)
          if (post.user._id === id) {
            setId(post._id)
          }
        }
      })
    })
  }, [Posts])
  console.log(username, bio, profilepic, Id)

  function Follow() {
    let followerId = JSON.parse(localStorage.getItem('profiles'))
    axios.post(`https://new-create-check.onrender.com/posts/${id}/followers`, {ID: Id, ID2: followerId})
    .then((response) => {
      console.log(response.data)
      setFollow((prevFollow) => {
        return [...prevFollow, response.data.following]
      })
      window.location.pathname = '/blogs'
    })
    .catch(error => console.error(error))
  }

  console.log(follow)

  return (
    <div>
      {
        <div>
          <h1>{username}</h1>
          <h2>{bio}</h2>
          <img src={profilepic} />
          <button onClick={Follow}>Follow</button>
        </div>
      }
    </div>
  )
}