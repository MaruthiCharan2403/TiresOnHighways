import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
export default function Navbar({ signInButton, setCookie }) {
  const [modal, setModal] = useState(false);
  const navigate = useNavigate()
  function handleOpenModal() {
    setModal(true);
  }
  const handleLogOut = async (e) => {
    e.preventDefault()
    const response = await axios.get(`https://tohexpress.onrender.com/logout`, { withCredentials: true })
    if (response.data) {
      setCookie(null)
      setModal(false);
      navigate('/');
    }

  }
  return (
    <nav className="container navbar navbar-expand-lg  border border-3 border-white rounded-5 w-75 mt-2 border-body" style={{ background: 'black' }} data-bs-theme="dark">
      <div className="container-fluid">
        <Link to="/" type='button' className="btn btn-light btn-outline-dark rounded-5 me-2" >HOME</Link>
        <button className="navbar-toggler rounded-5 border border-2 border-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/aboutus">AboutUs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stats">Statistics</Link>
            </li>
          </ul>
          {signInButton && (
            <Link to="/toll" className="nav-item btn btn-light btn-outline-dark rounded-5 ">Toll Sign In</Link>
          )}
          {!signInButton && (<button className="nav-item btn rounded-5 btn-danger btn-outline-dark text-white" data-bs-target="#exampleModal" onClick={handleOpenModal}>Sign Out</button>
          )}
          {modal && (
            <div>
              <div className="modal show" style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} data-bs-dismiss='modal'>
                <div className="modal-dialog" style={{ width: '100%', margin: 'auto' }}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="btn-close" data-bs-dismiss='modal'></button>
                    </div>
                    <div className="modal-body" style={{ color: 'white' }}>
                      Are you sure ?
                    </div>
                    <div class="modal-footer">
                      <button type="button" className="nav-item btn rounded-5 btn-danger btn-outline-dark text-white" data-bs-dismiss='modal' onClick={handleLogOut}>Sign Out</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
