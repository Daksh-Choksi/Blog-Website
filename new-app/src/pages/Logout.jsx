import { Form, redirect } from "react-router-dom";

export default function Logout() {
  
  function revert() {
    let info = JSON.parse(localStorage.getItem('show'))
    if (info) {
      localStorage.setItem('show', false)
    }
  }
  return (
    <Form method="POST" action="/logout">
      <p>Are you sure you want to logout? please save your blog before doing so.</p>
      <button onClick={revert}>Logout</button>
      <button>No</button>
    </Form>
  )
}

export let logoutAction = async ({request}) => {
  let data = await request.formData();
  return redirect('/')
}