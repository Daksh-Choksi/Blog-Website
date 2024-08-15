import { NavLink, Outlet } from "react-router-dom";

export default function Rootlayout() {
  let info = JSON.parse(localStorage.getItem('show'))
  function home() {
    window.location.pathname = '/'
  }
  return (
    <div>
      <header>
        <nav className="navElements">
          <h1 className="webName" onClick={home}>BlogaRouter</h1>
          <NavLink to="/" className="options">Home</NavLink>
          {
            !info
            ?
              <NavLink to="signup" className="options">Sign Up</NavLink>
            :
              <NavLink to="logout" className="options">Log Out</NavLink>
          }
          {
            info
            ?
            <div>
              <NavLink to="Newblogs" className="options">New Blog</NavLink>
              <NavLink to="savedBlog" className="options">Saved Blog(s)</NavLink>
              <NavLink to='blogs' className="options">Blogs</NavLink>
              <NavLink to="postedblogs" className="options">Posted Blogs</NavLink>
              <NavLink to="profile" className="options">Profile</NavLink>
            </div>
            :
            <div></div>
          }
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}