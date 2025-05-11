
import axios from "axios"
import { useEffect, useState } from "react";
import { Form, Link, redirect } from "react-router-dom"
import { getToken } from 'firebase/messaging';
import { messaging } from './firebase.js'; // Adjust the path as necessary


export default function Profile() {
  let loginInfo = JSON.parse(localStorage.getItem('credentials'));
    console.log(loginInfo)
  let [profile, setProfile] = useState([]);
  let [username, setUsername] = useState('');
  let [bio, setBio] = useState('');
  let [profilepic, setProfilepic] = useState(null);
  let [profileEmail, setProfileEmail] = useState(loginInfo.email);
  let [profilePassword, setProfilePassword] = useState(loginInfo.password);
  let [toggle, setToggle] = useState(() => {
    let info = localStorage.getItem('profile')
    return info ? JSON.parse(info) : false
  });
  let [id, setId] = useState(() => {
    let Id = localStorage.getItem('ID')
    return Id ? JSON.parse(Id) : ''
  });
  let [profileToggle, setProfileToggle] = useState(() => {
    let proToggle = localStorage.getItem('profileToggle')
    return proToggle ? JSON.parse(proToggle) : false
  });
  let [follow, setFollow] = useState(() => {
    let Follow = localStorage.getItem('followDisplay')
    return Follow ? JSON.parse(Follow) : []
  });
  let [followToggle, setFollowToggle] = useState(() => {
    let FollowToggle = localStorage.getItem('followToggle')
    return FollowToggle ? JSON.parse(FollowToggle) : false
  });
  let [followersToggle, setFollowersToggle] = useState(() => {
    let FollowersToggle = localStorage.getItem('followersToggle')
    return FollowersToggle ? JSON.parse(FollowersToggle) : false
  });
  let [followers, setFollowers] = useState([]);
  let [followerId, setFollowerId] = useState()

  console.log(profile)


  useEffect(() => {
    let followers2 = JSON.parse(localStorage.getItem('profiles'))
      axios.get('http://localhost:5000/profiles')
      .then((response) => {
        response.data.map((res) => {
          if (res._id === followers2) {
            setFollowers(res.followers)
          }
        })
      })
      .catch(error => console.error(error))
  }, [])

  useEffect(() => {
    localStorage.setItem('followersToggle', JSON.stringify(followersToggle))
  }, [followersToggle])

  useEffect(() => {
    localStorage.setItem('followDisplay', JSON.stringify(follow))
  }, [follow])

  useEffect(() => {
    localStorage.setItem('followToggle', JSON.stringify(followToggle))
  }, [followToggle])

  useEffect(() => {
    localStorage.setItem('profileToggle', JSON.stringify(profileToggle))
  }, [profileToggle])

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(toggle))
  }, [toggle])

  useEffect(() => {
    localStorage.setItem('ID', JSON.stringify(id))
  }, [id])

  function handlePic(event) {
    let pic = event.target.files[0]
    setProfilepic(pic)
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        }).catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        // Get FCM token
        const token = await getToken(messaging, { vapidKey: 'BMKIBxq4zso9tcYwJVIEAEfWJy3XScQbKLOXWBgx5IPiS-bFinCrf1fT2_rRA9VF56iRT-jZzVG2wzUSh7mLVwg'});
        console.log('FCM Token:', token);
        
        // Send token to your backend
        await sendTokenToBackend(token);
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (error) {
      console.error('Error getting notification permission:', error);
    }
  };

  // Function to send FCM token to your backend
  const sendTokenToBackend = async (token) => {
    let userId = JSON.parse(localStorage.getItem('profiles'))
    try {
      const response = await fetch(`http://localhost:5000/profiles/${userId}/fcm-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fcmToken: token }),
      });

      if (!response.ok) {
        throw new Error('Failed to update FCM token');
      }

      console.log('FCM token updated successfully');
    } catch (error) {
      console.error('Error sending FCM token to backend:', error);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, [])


  let handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('profilePic', profilepic);
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('email', loginInfo.email)
    formData.append('password', loginInfo.password)

    try {

      const method = followerId ? 'PUT' : 'POST';
      const url = followerId ? `http://localhost:5000/profiles/${followerId}` : 'http://localhost:5000/profiles';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setProfile([result.profile])
      requestNotificationPermission();
      setId(result.profile._id)
      profile.map((profiles => {
        localStorage.setItem('profiles1', JSON.stringify(profiles))
      }))
      setToggle(true)
      console.log('Profile saved successfully:', result.profile);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  useEffect(() => {
    axios.get('http://localhost:5000/profiles')
    .then(response => {
      response.data.map((res) => {
        if (res.email === loginInfo.email && res.password === loginInfo.password) {
          setId(res._id)
          setProfile([res])
        }
      })
    })
    .catch(error => console.error(error))
  }, [])

  useEffect(() => {
    profile.map((profiles => {
      localStorage.setItem('profiles', JSON.stringify(profiles._id))
      localStorage.setItem('profiles1', JSON.stringify(profiles))
    }))
  }, [id])


  function renderToggle1(profileId) {
    console.log(profileId)
    setFollowerId(profileId)
    setToggle(false)
    }

    function credentialsChange() {
      setProfileToggle(true)
    }

    function SaveCredentialsChange() {
      let loginInfo = JSON.parse(localStorage.getItem('credentials'))
      setProfileToggle(false)
      localStorage.setItem('credentials', JSON.stringify({firstName: loginInfo.firstName, lastName: loginInfo.lastName, email: profileEmail, password: profilePassword}))
    }

    function Following() {
      let followers2 = JSON.parse(localStorage.getItem('profiles'))
      let followDisplayHelper;
      let Follow = JSON.parse(localStorage.getItem('follow'))
      console.log(Follow)
      if (Follow === undefined) {
        Follow = []
      }
      else {
        Follow = JSON.parse(localStorage.getItem('follow'))
      }
      console.log(Follow)
      axios.get('http://localhost:5000/profiles')
      .then(response => {
        response.data.map((res) => {
          if (followers2 === res._id) {
            followDisplayHelper = res.following
          }
        })
        let uniqueFollowDisplayHelper = []
        followDisplayHelper.every((user) => {
          if (!uniqueFollowDisplayHelper.includes(user)) {
            uniqueFollowDisplayHelper.push(user)
          }
          return true;
        })
        setFollow(uniqueFollowDisplayHelper)
        setFollowToggle(true)
      })
      .catch(error => console.error(error))
    }

    function Unfollow(id) {
      let followers2 = JSON.parse(localStorage.getItem('profiles'))
      console.log(id)
      console.log(followers2)
      let newFollow = []
      let checkFollow = []
      let Follow = JSON.parse(localStorage.getItem('followDisplay'))
      console.log(Follow)
      Follow.map((account) => {
        if (id !== account._id) {
          newFollow.push(account)
        }
      })
      if (newFollow.length === 0) {
        setFollowToggle(false)
      }
      console.log(newFollow)
      setFollow(newFollow)
      if (newFollow.length === 0) {
        localStorage.setItem('follow', JSON.stringify([]))
      }
      else if (newFollow.length !== 0) {
        newFollow.map((follower) => {
          checkFollow.push(follower._id)
          localStorage.setItem('follow', JSON.stringify(checkFollow))
        })
      }
      let ID;
      axios.get('http://localhost:5000/posts')
      .then((response) => {
        response.data.map((res) => {
          if (res.user._id === id) {
            ID = res._id
          }
        })
        console.log(ID)
        // arre jab ye delete ho rha hai then delete the follower here locally also.
        if (ID !== undefined) {
          axios.delete(`http://localhost:5000/posts/${ID}/followers`, {data: {Id: followers2, followingId: id}})
          .then((response) => {
          console.log(response.data.post._id)
          let ID1 = (response.data.post._id)
          axios.post(`http://localhost:5000/posts/${ID1}/keepFollowers`)
          .then((repsonse) => console.log(repsonse.data))
          .catch(error => console.error(error))
        })
        .catch(error => console.error(error))
        }
        else {
          axios.delete(`http://localhost:5000/posts/${id}/followersAfterNoPost`, {data: {Id: followers2}})
          .then(response => console.log(response.data))
          .catch(error => console.error(error))
        }
      })
      .catch(error => console.error(error))
    }
    function done() {
      setFollowToggle(false)
    }

    function Followers() {
      let followers2 = JSON.parse(localStorage.getItem('profiles'))
      axios.get('http://localhost:5000/profiles')
      .then((response) => {
        let uniqueFollowersId = []
        let uniqueFollowers = []
        response.data.map((res) => {
          if (res._id === followers2) {
            res.followers.every((user) => {
              if (!uniqueFollowersId.includes(user._id)) {
                uniqueFollowersId.push(user._id)
                uniqueFollowers.push(user)
              }
              return true;
            })
          }
        })
        console.log(uniqueFollowers)
        setFollowers(uniqueFollowers)
        setFollowersToggle(true)
      })
      .catch(error => console.error(error))
    }

    function check() {
      setFollowersToggle(false)
    }

    let [secondFollower, setSecondFollower] = useState(() => {
      let follower2 = localStorage.getItem('secondFollower')
      return follower2 ? JSON.parse(follower2) : false
    })
    let [allProfiles, setAllProfiles] = useState([])

    useEffect(() => {
      localStorage.setItem('secondFollower', JSON.stringify(secondFollower))
    }, [secondFollower])

    useEffect(() => {
      axios.get('http://localhost:5000/profiles')
      .then((response) => setAllProfiles(response.data))
    }, [])

    let [search, setSearch] = useState('')

    function Search() {
      setSecondFollower(true)
      let keywords = search.split(' ');
      let matches;
      let element;
      allProfiles.forEach((profile) => {
        matches = keywords.some(keyword => profile.username.includes(keyword.toLowerCase()) || profile.bio.includes(keyword.toLowerCase()))
        if (search !== '' && matches) {
          element = document.getElementById(`${profile._id}`);
          element.style.display = 'block';
        }
        else if (search !== '' && !matches) {
          element = document.getElementById(`${profile._id}`);
          element.style.display = 'none';
        }
        else if (search === '') {
          element = document.getElementById(`${profile._id}`);
          element.style.display = 'none';
        }
        else {
          element = document.getElementById(`${profile._id}`)
          element.style.display = 'block';
        }
      })
    }

    useEffect(() => {
      if (search !== '') {
        setSecondFollower(true)
        let keywords = search.split(' ');
        let matches;
        let element;
        allProfiles.forEach((profile) => {
          matches = keywords.some(keyword => profile.username.includes(keyword.toLowerCase()) || profile.bio.includes(keyword.toLowerCase()))
          if (search !== '' && matches) {
            element = document.getElementById(`${profile._id}`);
            element.style.display = 'block';
          }
          else if (search !== '' && !matches) {
            element = document.getElementById(`${profile._id}`);
            element.style.display = 'none';
          }
          else if (search === '') {
            element = document.getElementById(`${profile._id}`);
            element.style.display = 'none';
          }
          else {
            element = document.getElementById(`${profile._id}`)
            element.style.display = 'block';
          }
        })
      }
      else if (search === '') {
        setSecondFollower(false)
        allProfiles.forEach((profile) => {
          document.getElementById(`${profile._id}`).style.display = 'none'
        })
      }
    }, [search])

    function secondFollow(followingId) {
      console.log(followingId)
      let followers2 = JSON.parse(localStorage.getItem('profiles'))
      console.log(followers2)
      axios.post(`http://localhost:5000/profiles/${followingId}/followers`, {ID: followers2})
      .then((response) => {
        axios.post(`http://localhost:5000/profiles/${followingId}/secondFollowers`, {ID: followers2})
        alert(`followed ${response.data.username}`)
        console.log(response.data)
      })
      .catch(error => console.error(error))
    }

    function revert() {
      setSearch('')
      setSecondFollower(false)
    }
    
    console.log(JSON.parse(localStorage.getItem('profiles')))
    console.log(follow)
    console.log(followers)

  return (
    <div>
     {
      !toggle
      ?
      <Form method="POST" onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          <span>UserName</span>
          <input id="username" name="username" type='text' style={{display: 'block', marginBottom: '10px'}} required value={username} onChange={(e) => setUsername(e.target.value)}></input>
        </label>
        <label>
          <p style={{marginBottom: '0'}}>Bio</p>
          <textarea id="bio" name="bio" style={{marginTop: '0', display: 'block', marginBottom: '40px'}} value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
        </label>
        <label>
          <span>Profile Picture</span>
          <input id="profilepic" name="profilepic" type='file' onChange={handlePic}></input>
        </label>
        <button type="submit">Save</button>
      </Form>
      :
      <div>
        {profile.map(profiles => (
          <div key={profiles._id}>
          <p>UserName - {profiles.username}</p>
          <p>Bio - {profiles.bio}</p>
          <img src={profiles.profilepic} style={{display: 'block', height: '200px', width: '200px'}} />
          <button onClick={() => renderToggle1(profiles._id)} style={{display: 'block'}}>Edit</button>
          {!profileToggle
            ?
            <button onClick={credentialsChange}>Account Settings</button>
            :
            <div>
              <label>
                <span>Email ID</span>
                <input type='email' value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required />
              </label>
              <label>
                <span>Password</span>
                <input type='password' value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} required />
              </label>
              <button onClick={SaveCredentialsChange}>Save Changes</button>
            </div>
          }
          {
            !followToggle
            ?
            <button onClick={Following}>Following</button>
            :
            <div>
              {follow.map(account => (
                <div key={account._id}>
                  <h2>{account.username}</h2>
                  <p>{account.bio}</p>
                  <img src={account.profilepic} />
                  <button onClick={() => Unfollow(account._id)}>Unfollow</button>
                  <Link to={`chat/${account._id.toString()}`}><button>Chat</button></Link>
                </div>
              ))}
              <button onClick={done}>Done</button>
            </div>
          }
          {
            !followersToggle
            ?
            <button onClick={Followers}>Followers</button>
            :
            <div>
              {followers.map(account => (
                <div key={account._id}>
                <h2>{account.username}</h2>
                <p>{account.bio}</p>
                <img src={account.profilepic} />
                <Link to={`chat/${account._id.toString()}`}><button>Chat</button></Link>
              </div>
              ))}
              <button onClick={check}>Done</button>
            </div>
          }
          <div>
          <input id='search' type="search" placeholder="Search for Profiles" value={search} onChange={(e) => setSearch(e.target.value)}></input>
          <button onClick={Search}>Search</button>
          {
            allProfiles.map(profile => (
              <div key={profile._id}>
                <div id={profile._id} style={{display: 'none'}}>
                  <p>{profile.username}</p>
                  <p>{profile.bio}</p>
                  <img src={profile.profilepic} />
                  <button onClick={() => secondFollow(profile._id)}>Follow</button>
                  {
                    !secondFollower
                    ?
                    <div></div>
                    :
                    <button onClick={revert}>Done</button>
                  }
                </div>
              </div>
            ))
          }
          </div>
      </div>
          ))}
      </div>
      }
    </div>
  )
}
