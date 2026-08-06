import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/auth");
  }

  return (
    <nav>
      <div className="nav-brand">Mynds</div>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
          Home
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Produtos
        </NavLink>
        {isLoggedIn ? (
          <button type="button" className="nav-logout" onClick={logout}>
            Sair
          </button>
        ) : (
          <NavLink to="/auth" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Login
          </NavLink>
        )}
      </div>

    </nav>
  );
}

export default Navbar;