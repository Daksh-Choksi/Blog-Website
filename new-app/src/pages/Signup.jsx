import { useEffect, useRef, useState } from "react";
import { Form, Link, redirect, useActionData } from "react-router-dom";
import emailjs from "@emailjs/browser"
import isEmail from "validator/lib/isEmail";
import axios from "axios";


let form;
export default function Signup() {
  form = useRef();
    let info = JSON.parse(localStorage.getItem('credentials'));
    console.log(info)
    let [information, setInformation] = useState([info])

      window.addEventListener('submit', () => {
        setInformation((prevInfo) => {
          return [...prevInfo, info]
        })
      })
    
    localStorage.setItem('newCredentials', JSON.stringify(information))

    let [show, setShow] = useState(() => {
      let extraShow = localStorage.getItem('show');
      return extraShow ? JSON.parse(extraShow) : false
    })

    useEffect(() => {
      localStorage.setItem('show', JSON.stringify(show))
    }, [show])

    function change() {
      setShow(prevShow => !prevShow)
    }

  let data = useActionData()
  return (
    <div>
      <script type="text/javascript" src="https://cdn.emailjs.com/dist/email.min.js"></script>
      <script type="text/javascript">
      (function() {
            emailjs.init("OlOFntLRjA17-LQW_")
        })();
      </script>
      <Form ref={form} method="POST" action="/signup" className="form">
        <label>
          <span>First Name</span>
          <input id="firstName" name="firstName" required/>
        </label>
        <label>
          <span>Last Name</span>
          <input id="lastName" name="lastName" required/>
        </label>
        <label>
          <span>Your email:</span>
          <input id="email" type="email" name="email" required />
        </label>
        <label>
          <span>Create a Password</span>
          <input id="password" type="password" name="password" required/>
        </label>
        <button onClick={change}>Sign up</button>
      </Form>
      {data && data.error && <p>{data.error}</p>}
      <p>Already have an account? <Link to="login">Login</Link></p>
    </div>
  )
}


export let signupActions = async ({ request }) => {
  let data = await request.formData()

  let submission = {
    firstName: data.get('firstName'),
    lastName: data.get('lastName'),
    email: data.get('email'),
    password: data.get('password')
  }

  let info = JSON.parse(localStorage.getItem('newCredentials'))
  console.log(info)

  localStorage.setItem('credentials', JSON.stringify(submission))
  localStorage.setItem('profile', JSON.stringify(false))

  let toggler = false

  await axios.get('http://localhost:5000/profiles')
  .then((response) => {
    response.data.map((res) => {
      if (submission.email === res.email) {
        toggler = true
      }
    })
  })

  if (toggler) {
    return {error: 'This Email is already registered please Login'}
  }


  let Email = isEmail(`${submission.email}`)

  

  if (!Email) {
    return {error: 'This Email does not exist'}
  }

  email()

  return redirect('/profile')
}

function email() {
  const email = document.getElementById('email').value;
  let name = document.getElementById('firstName').value;

  emailjs.sendForm("service_thp18mj", "template_7bevwoc", form.current, {
    to_email: email,
    to_name: name
  }).then(function(response) {
      console.log('SUCCESS!', response.status, response.text);
      alert('Email sent successfully');
  }, function(error) {
      console.log('FAILED...', error);
      alert('Failed to send email');
  });

}