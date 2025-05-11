import { useEffect, useState, useRef } from "react"
import { Await, Form, redirect, useLoaderData, useParams } from "react-router-dom"
import { Editor } from '@tinymce/tinymce-react';
import axios from "axios";


export default function SavedBlogDisplay() {
  let editorRef = useRef(null)
  let {id} = useParams()
  let [secondId, setSecondId] = useState()
  let [display, setDisplay] = useState('');
  let [title, setTitle] = useState('');
  let [blogPost, setBlogPost] = useState(() => {
    let post = localStorage.getItem("blogPublish")
    return post ? JSON.parse(post) : []
  })
  let [check, setCheck] = useState(() => {
    let Check = localStorage.getItem('stateCheck')
    return Check ? JSON.parse(Check) : []
  })

  useEffect(() => {
    localStorage.setItem('stateCheck', JSON.stringify(check))
  }, [check])

  useEffect(() => {
    localStorage.setItem("blogPublish", JSON.stringify(blogPost))
  }, [blogPost]) 

  let [newId, setNewId] = useState(() => {
    let Id = localStorage.getItem('id')
    return Id ? JSON.parse(Id) : 1000000000000000
  })

  useEffect(() => {
    localStorage.setItem('id', JSON.stringify(newId))
  }, [newId])

  useEffect(() => {
    let Id = JSON.parse(localStorage.getItem('profiles'))
    let info = JSON.parse(localStorage.getItem("blogPost1"))
    console.log(info)
    axios.get('http://localhost:5000/profiles')
    .then((response) => {
      response.data.map((res) => {
        if (res._id === Id) {
          res.savedBlogs.forEach((element) => {
            if (element !== null) {
              if (Number(element.id) === Number(id)) {
                setDisplay(element.content);
                setTitle(element.title)
                setSecondId(element.secondid)
              }
            }
          })
        }
      })
    })
    .catch(error => console.error(error))
  }, [])
  function publish() {
    let loginInfo = JSON.parse(localStorage.getItem('credentials'));
    let profileInformation = JSON.parse(localStorage.getItem('profiles1'))
    let comments;
    let title = document.querySelector('.title').value
    let author = profileInformation.username
    let blogValue1 = editorRef.current.getContent({format: 'text'});
    let Post = {title: title, content: blogValue1, author: author, id: id, comments: comments, secondid: secondId, email: loginInfo.email, password: loginInfo.password}
    setBlogPost((prevBlogPost) => {
      return [...prevBlogPost, Post]
    })
    setCheck((prevCheck) => {
      return [...prevCheck, Post]
    })
  }
  function done() {
    let Id = JSON.parse(localStorage.getItem('profiles'))
    let profileInformation = JSON.parse(localStorage.getItem('profiles1'))
    setNewId((prevId) => {
      return prevId += 1
    })
    let loginInfo = JSON.parse(localStorage.getItem('credentials'));
    let email = loginInfo.email
    let password = loginInfo.password
    let contentId = Number(id) + newId;
    let title = document.querySelector('.title').value
    let author = profileInformation.username
    let blogValue = editorRef.current.getContent({format: 'text'});
    let post = {blogValue, contentId, title, author, secondId, email, password}
    localStorage.setItem('blogPost', JSON.stringify({blogValue, contentId, title, author, secondId, email, password}))
    axios.post(`http://localhost:5000/profiles/${Id}/savedBlogs`, post)
    .then((response) => {
      console.log(response)
    })
    .catch(error => console.error(error))
  }
  function remove() {
    let Id = JSON.parse(localStorage.getItem('profiles'))
    let ID;
    let info = JSON.parse(localStorage.getItem("blogPost1"))
    console.log(info)
    info.forEach((element) => {
      if (Number(element.id) === Number(id)) {
        ID = element.id
      }
    })
    console.log(ID)
    axios.delete(`http://localhost:5000/profiles/${Id}/savedBlogs`, {
      data: {deleteId: ID}
    })
    .then((response) => {
      console.log(response)
    })
    .catch(error => console.error(error))
  }
  return (
    <div>
      <label>
        <span>Title</span>
        <input className="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <Editor
        apiKey='he55jmqgh6t058ux3fk782dsyoez9gaukhi1lh7wwcg5p29s'
        onInit={(_evt, editor) => editorRef.current = editor}
        initialValue = {`<p>${display}</p>`}
        init={{
          height: 500,
          menubar: true,
          branding: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
      <Form method="POST">
        <button onClick={publish}>Publish</button>
        <button onClick={done}>Done</button>
        <button onClick={remove}>Remove</button>
      </Form>
    </div>
  )
}

export let SavedBlogDisplayActions = async () => {
  return redirect('/savedBlog')
}