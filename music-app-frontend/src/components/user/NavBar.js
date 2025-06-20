import { useState } from "react"
import ReactDOM from "react-dom"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/AuthContext"
import { SiMusicbrainz } from "react-icons/si"
import {
  HiHome,
  HiCollection,
  HiLogin,
  HiUserAdd,
  HiLogout,
  HiBadgeCheck
} from "react-icons/hi"
import GrantAdminModal from "./GrantAdminModal"
import { AnimatePresence } from "motion/react"

const NavBar = () => {
  const { isLoggedIn, isAdmin, userEmail, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isGrantAdminModalOpen, setIsGrantAdminModalOpen] = useState(false)

  // spr czy link jest aktywny
  const isActive = (path) => {
    return location.pathname === path
  }

  // generowanie klas css
  const getLinkClasses = (path) => {
    const baseClasses =
      "text-gray-300 hover:text-white hover:bg-purple-600/30 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 flex items-center space-x-2"
    return isActive(path)
      ? `${baseClasses} bg-purple-600/30 text-white`
      : baseClasses
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  };

  const openGrantAdminModal = () => {
    setIsGrantAdminModalOpen(true)
  }

  const closeGrantAdminModal = () => {
    setIsGrantAdminModalOpen(false)
  }

  return (
    <div>
      <nav className="bg-gray-900 shadow-md sticky top-0 z-50 border-b border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <SiMusicbrainz className="text-3xl text-purple-400" />
              <span className="text-xl font-bold text-white">Music App</span>
            </Link>

            {/* nawigacja */}
            <div className="flex items-center space-x-6">

              <Link to="/" className={getLinkClasses("/")}>
                <HiHome className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {/* My Library - jeśli jest zalogowany */}
              {isLoggedIn && (
                <Link to="/my-library" className={getLinkClasses("/my-library")}>
                  <HiCollection className="w-4 h-4" />
                  <span>My Library</span>
                </Link>
              )}

              {/* Nadanie praw admina - jeśli sam jest adminem */}
              {isAdmin && (
                <button
                  onClick={openGrantAdminModal}
                  className="text-gray-300 hover:text-white hover:bg-purple-600/30 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 flex items-center space-x-2"
                >
                  <HiBadgeCheck className="w-4 h-4" />
                  <span>Grant Admin Rights</span>
                </button>
              )}

              {/* logowanie/wylogowanie */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white hover:bg-purple-600/30 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 flex items-center space-x-2"
                  >
                    <HiLogout className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                  <span className="text-sm text-gray-400">
                    Welcome, {userEmail.split("@")[0]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className={getLinkClasses("/login")}>
                    <HiLogin className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/register" className={getLinkClasses("/register")}>
                    <HiUserAdd className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {ReactDOM.createPortal(
        <AnimatePresence>
          {isGrantAdminModalOpen && (
            <GrantAdminModal key="grantAdminModal" onClose={closeGrantAdminModal} />
          )}
        </AnimatePresence>
        , document.body)}

    </div>
  )
}

export default NavBar
