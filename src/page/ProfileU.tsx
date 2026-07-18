import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, requireRole } from "../utils/auth";
import { getSessionUser, getWallet, hasPremium } from "../utils/platform";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

const ProfileU = () => {
  const navigate = useNavigate();
  const session = getSessionUser();
  const wallet = getWallet();

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  const logout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <div className="mentor-app-layout">
      <aside className="mentor-sidebar d-none d-lg-flex">
        <Link to="/User" className="mentor-brand">
          <img src={logo} alt="Mentor.uz" />
          <span>Mentor.uz</span>
        </Link>

        <nav className="mentor-nav">
          <span className="menu-label">Dashboard</span>
          <NavLink to="/ProfileU" end>
            <i className="bi bi-speedometer2"></i> Umumiy ko'rinish
          </NavLink>
          <NavLink to="/ProfileU/AI">
            <i className="bi bi-stars"></i> AI Ustoz
          </NavLink>
          <NavLink to="/ProfileU/BecomeTeacher">
            <i className="bi bi-mortarboard"></i> O'qituvchi bo'lish
          </NavLink>
          <NavLink to="/User">
            <i className="bi bi-collection-play"></i> Kurslarga qaytish
          </NavLink>
        </nav>

        <div className="sidebar-support">
          <strong>{hasPremium(wallet) ? "Premium faol" : `${wallet.tCoins} T-Coin`}</strong>
          <span>{session.email || "Profil ma'lumotlari"}</span>
        </div>
      </aside>

      <div className="mentor-main">
        <header className="mentor-topbar">
          <div>
            <span className="section-kicker">Profile workspace</span>
            <h1 className="topbar-title">{session.name}</h1>
          </div>
          <div className="topbar-controls">
            <Link to="/User" className="btn btn-outline-dark rounded-pill px-4">
              <i className="bi bi-arrow-left me-2"></i> Kurslar
            </Link>
            <button onClick={logout} className="icon-button danger" aria-label="Chiqish">
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </header>

        <main className="mentor-content">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-bottom-nav d-lg-none">
        <NavLink to="/ProfileU" end aria-label="Dashboard">
          <i className="bi bi-speedometer2"></i>
          <span>Panel</span>
        </NavLink>
        <NavLink to="/ProfileU/AI" aria-label="AI">
          <i className="bi bi-stars"></i>
          <span>AI</span>
        </NavLink>
        <NavLink to="/ProfileU/BecomeTeacher" aria-label="Teacher">
          <i className="bi bi-mortarboard"></i>
          <span>Mentor</span>
        </NavLink>
        <NavLink to="/User" aria-label="Kurslar">
          <i className="bi bi-collection-play"></i>
          <span>Kurs</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default ProfileU;
