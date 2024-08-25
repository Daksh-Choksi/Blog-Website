import axios from "axios";
import { useEffect, useState } from "react";
import { Form, redirect, useActionData } from "react-router-dom";

export default function Login() {
  
  let info = JSON.parse(localStorage.getItem('show'))
  function change() {
    if (!info) {
      localStorage.setItem('show', true)
    }
  }
  let loginData = useActionData()
  return (
    <div>
      <Form method="POST" action="/signup/login">
        <label>
          <span>Your email:</span>
          <input type="email" name="email" required />
        </label>
        <label>
        <span>Your Password:</span>
        <input type="password" name="password" required/>
        </label>
        <button onClick={change}>Login</button>
      </Form>
      {loginData && loginData.error && <p>{loginData.error}</p>}
    </div>
  )
}


export let loginActions = async ({ request }) => {
  let data = await request.formData()

  let submission = {
    email: data.get('email'),
    password: data.get('password')
  }
  
  let info = JSON.parse(localStorage.getItem('credentials'))
  localStorage.setItem('loginCredentials', JSON.stringify(submission))
  let loginInfo = JSON.parse(localStorage.getItem('loginCredentials'))
  let newCredentials = {
    firstName: info.firstName,
    lastName: info.lastName,
    email: submission.email,
    password: submission.password
  }
  console.log(localStorage.getItem('profile'))
  localStorage.setItem('profile', JSON.stringify(true))
  
  let email = []
  let password = []
  let emailToggler = false
  let passwordToggler = false

  await axios.get('https://new-create-check.onrender.com/profiles')
  .then((response) => {
    response.data.map((res) => {
      email.push(res.email)
      password.push(res.password)
    })
    console.log(email, password)
    for (let i = 0; i < email.length; i++) {
      if (email[i] === submission.email && password[i] === submission.password) {
        emailToggler = true
        passwordToggler = true
        break
      }
      else {
        continue
      }
    }
  })

  console.log(passwordToggler, emailToggler)

  if (emailToggler && passwordToggler) {
    localStorage.setItem('credentials', JSON.stringify(newCredentials))
    console.log(info)
    return redirect('/')
  }
  else {
    return {error: 'Either the password or the email address is incorrect'}
  }
}