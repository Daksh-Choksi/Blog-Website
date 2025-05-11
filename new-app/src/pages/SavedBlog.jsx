import { useEffect, useState } from "react";
import Blog from "./NewBlogs";
import { Form, NavLink, redirect } from "react-router-dom";
import axios from "axios";

export default function SavedBlog() {
  let Id = JSON.parse(localStorage.getItem('profiles'))
  let loginInfo = JSON.parse(localStorage.getItem('credentials'));
  const [blogs, setBlogs] = useState(() => {
    const storedBlogs = localStorage.getItem('blogPost1');
    return storedBlogs ? JSON.parse(storedBlogs) : [];
  });
  const [Blogs, SetBlogs] = useState([])

  useEffect(() => {
    localStorage.setItem('blogPost1', JSON.stringify(blogs));
  }, [blogs]);

  useEffect(() => {
    const newBlogContent = JSON.parse(localStorage.getItem('blogPost'));
    if (newBlogContent) {
      const newBlog = { content: newBlogContent.blogValue, id: newBlogContent.contentId, author: newBlogContent.author, title: newBlogContent.title, secondid: newBlogContent.secondid, email: newBlogContent.email, password: newBlogContent.password};
      setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
      localStorage.removeItem('blogPost');
    }
  }, [blogs]);

  useEffect(() => {
    axios.get('http://localhost:5000/profiles')
    .then((response) => {
      response.data.map((res) => {
        if (res._id === Id) {
          SetBlogs(res.savedBlogs)
        }
      })
    })
    .catch(error => console.error(error))
  }, [Blogs])
  return (
    <div>
      {Blogs.map((blog, index) => (
        blog !== null
        ?
        <div key={index}>
          <NavLink to={blog.id.toString()}>
            <h2>{blog.title}</h2>
          </NavLink>
          <p>{blog.content}</p>
        </div>
        :
        <div key={index}></div>
        ))}
    </div>
  )
}