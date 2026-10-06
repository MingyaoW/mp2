import { Link, Route, Routes } from 'react-router-dom'
import ListView from './ListView'
import GalleryView from './GalleryView'
import DetailView from './DetailView'
import './App.css'
function App() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            NASA Explorer
          </div>

          <div className="nav-links">
            <Link className="nav-link" to="/">
              List
            </Link>

            <Link className="nav-link" to="/gallery">
              Gallery
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ListView />} />
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/details/:nasaId" element={<DetailView />} />
      </Routes>
    </>
  )
}

export default App