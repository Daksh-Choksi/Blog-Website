import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import { Form, redirect } from 'react-router-dom';

let editorRef;
export default function Blog() {
  editorRef = useRef(null)

  let count = ((Math.random()).toFixed(2)) * 10

  let [uniqueCounter, setUniqueCounter] = useState(() => {
    let count1 = localStorage.getItem('uniqueCount')
    return count1 ? JSON.parse(count1) : 0
  })

  let [counter, setCounter] = useState(() => {
    let count = localStorage.getItem('count')
    return count ? JSON.parse(count) : 0
  })

  let [work, setWork] = useState(() => {
    let info = localStorage.getItem('stateCheck')
    return info ? JSON.parse(info) : []
  })

  useEffect(() => {
    localStorage.setItem('uniqueCount', JSON.stringify(uniqueCounter))
  }, [uniqueCounter])

  useEffect(() => {
    localStorage.setItem('stateCheck', JSON.stringify(work))
  }, [work])

  useEffect(() => {
    localStorage.setItem('count', counter)
  }, [counter])

  function save() {
    let Id = JSON.parse(localStorage.getItem('profiles'))
    let loginInfo = JSON.parse(localStorage.getItem('credentials'));
    let profileInformation = JSON.parse(localStorage.getItem('profiles1'))
    setCounter((prevCounter) => {
      return prevCounter += 1
    })
    setUniqueCounter((prevCounter) => {
      return prevCounter += count
    })
    let title = document.querySelector('.Title').value
    let author = profileInformation.username
    let blogValue = editorRef.current.getContent({format: 'text'});
    let contentId = counter;
    let secondId = uniqueCounter
    console.log(blogValue)
    let post = {blogValue, contentId, title, author, uniqueCounter, secondid: secondId, email: loginInfo.email, password: loginInfo.password}
    localStorage.setItem("blogPost", JSON.stringify({blogValue, contentId, title, author, uniqueCounter, secondid: secondId, email: loginInfo.email, password: loginInfo.password}))
    console.log(contentId, post)
    axios.post(`https://new-create-check.onrender.com/profiles/${Id}/savedBlogs`, post)
    .then((response) => {
      console.log(response.data)
    })
    .catch(error => console.error(error))
  }
  function publish() {
    let loginInfo = JSON.parse(localStorage.getItem('credentials'));
    let profileInformation = JSON.parse(localStorage.getItem('profiles1'))
    setUniqueCounter((prevCounter) => {
      return prevCounter += count
    })
    setCounter((prevCounter) => {
      return prevCounter += 1
    })
    let comments;
    let title = document.querySelector('.Title').value
    let author = profileInformation.username
    let blogValue = editorRef.current.getContent({format: 'text'});
    let contentId = counter;
    let secondId = uniqueCounter
    console.log(blogValue)
    localStorage.setItem("blogPublish", JSON.stringify([{content: blogValue, title: title, author: author, id: contentId, comments: comments, secondid: secondId, email: loginInfo.email, password: loginInfo.password}]))
    let post = {content: blogValue, title: title, author: author, id: contentId, comments: comments, secondid: secondId, email: loginInfo.email, password: loginInfo.password}
    console.log(contentId)
    setWork((prevWork) => {
      return [...prevWork, post]
    })
  }
  
  return (
    <div className='blogContainer'>
      <label>
        <span>Title</span>
        <input className='Title' required/>
      </label>
      <Editor
        apiKey='he55jmqgh6t058ux3fk782dsyoez9gaukhi1lh7wwcg5p29s'
        onInit={(_evt, editor) => editorRef.current = editor}
        initialValue="<p>Write here.</p>"
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
      <Form action="//blog">
      <button className='blogButton' onClick={save}>Done</button>
      <button className='blogButton' onClick={publish}>Publish</button>
      </Form>
    </div>
  )
}

export let done = async () => {
  save();
  return redirect('/')
}
