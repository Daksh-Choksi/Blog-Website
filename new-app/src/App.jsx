import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Route, RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom"
import Home from './pages/Home'
import Rootlayout from './Layout/RootLayout'
import Signup, { signupActions } from './pages/Signup'
import Login, { loginActions } from './pages/Login'
import NewBlogs, { done } from './pages/NewBlogs'
import SavedBlog from './pages/SavedBlog'
import SavedBlogDisplay, { SavedBlogDisplayActions } from './pages/SavedBlogDisplay'
import Logout, { logoutAction } from './pages/Logout'
import Blogs from './pages/Blogs'
import PostedBlogs from './pages/PostedBlogs'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import NewDisplay from './pages/newDisplay'
import Chat from './pages/Chat'

function App() {
  let [display, Setdisplay] = useState(true)

  let router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/'>
        <Route path='/' element={<Rootlayout />}>
          <Route path='/' element={<Home />}/>
          <Route path='Newblogs' element={<NewBlogs />} action={done} />
          <Route path='/savedBlog' element={<SavedBlog />} />
          <Route path='blogs' element={<Blogs />} />
          <Route path='/postedblogs' element={<PostedBlogs />} />
          <Route path='profile' element={<Profile />} />
        </Route>
        <Route path='signup' element={<Signup />} action={signupActions}/>
        <Route path='signup/login' element={<Login />} action={loginActions}/>
        <Route path='savedBlog/:id' element={<SavedBlogDisplay />} action={SavedBlogDisplayActions}/>
        <Route path='logout' element={<Logout />} action={logoutAction} />
        <Route path='blogs/:id' element={<UserProfile />} />
        <Route path='newDisplay' element={<NewDisplay />} />
        <Route path='profile/chat/:id' element={<Chat />} />
      </Route>
    )
  )

  function toggle() {
    Setdisplay(prevDisplay => !prevDisplay)
  }



  return (
    <div className='homeContainer'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
