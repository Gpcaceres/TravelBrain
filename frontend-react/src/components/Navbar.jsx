import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

export default function Navbar() {
  const { getUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [user] = useState(getUser())
  const [showMenu, setShowMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest('.user-menu')) {
        setShowMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenu])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/trips', label: 'My Trips' },
    { to: '/itineraries', label: 'Itineraries' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/weather', label: 'Weather' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-content">
          {/* Logo */}
          <Link to="/dashboard" className="navbar-left">
            <img src="/assets/images/logo.png" alt="Logo" className="navbar-logo" />
            <span className="navbar-brand">TravelBrain</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="navbar-right">
            {/* User Menu - Desktop */}
            <div className="user-menu desktop-only">
              <button
                className="user-menu-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
              >
                <div className="user-avatar">
                  {(user?.name || user?.username || 'U').substring(0, 2).toUpperCase()}
                </div>
                <span className="user-name">{user?.name || user?.username || 'User'}</span>
                <svg
                  className={`dropdown-arrow ${showMenu ? 'rotated' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>

              {showMenu && (
                <div className="user-menu-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {(user?.name || user?.username || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="dropdown-name">{user?.name || user?.username || 'User'}</p>
                        <p className="dropdown-email">{user?.email || ''}</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/profile" className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="hamburger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <button
          className="mobile-nav-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* User Info in Mobile */}
        <div className="mobile-user-info">
          <div className="mobile-user-avatar">
            {(user?.name || user?.username || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="mobile-user-name">{user?.name || user?.username || 'User'}</p>
            <p className="mobile-user-email">{user?.email || ''}</p>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mobile-nav-divider"></div>
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
          <button onClick={handleLogout} className="nav-link logout-link">
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
