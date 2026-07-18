import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, requireRole } from "../utils/auth";
import {
  applyThemeMode,
  getLanguage,
  getSessionUser,
  getThemeMode,
  getWallet,
  setLanguage as persistLanguage,
  translate,
} from "../utils/platform";
import type { LanguageCode, ThemeMode } from "../utils/types";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

const User = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<LanguageCode>(() => getLanguage());
  const [theme, setTheme] = useState<ThemeMode>(() => getThemeMode());
  const session = getSessionUser();
  const wallet = getWallet();

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  useEffect(() => {
    applyThemeMode(theme);
  }, [theme]);

  const updateLanguage = (value: LanguageCode) => {
    persistLanguage(value);
    setLanguage(value);
  };

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
          <span className="menu-label">Platforma</span>
          <NavLink to="/User" end>
            <i className="bi bi-collection-play"></i> {translate("courses", language)}
          </NavLink>
          <NavLink to="/User/Sourcecode">
            <i className="bi bi-code-slash"></i> Kod manbalar
          </NavLink>
          <NavLink to="/ProfileU">
            <i className="bi bi-speedometer2"></i> {translate("dashboard", language)}
          </NavLink>
          <NavLink to="/ProfileU/AI">
            <i className="bi bi-stars"></i> {translate("aiTeacher", language)}
          </NavLink>
        </nav>

        <div className="sidebar-support">
          <strong>{wallet.tCoins} T-Coin</strong>
          <span>Premium, spin va sertifikat bonuslari uchun balans</span>
        </div>
      </aside>

      <div className="mentor-main">
        <header className="mentor-topbar">
          <div>
            <span className="section-kicker">Student workspace</span>
            <h1 className="topbar-title">Xush kelibsiz, {session.name}</h1>
          </div>

          <div className="topbar-controls">
            <select
              aria-label="Til"
              value={language}
              onChange={(event) => updateLanguage(event.target.value as LanguageCode)}
              className="form-select compact-select"
            >
              <option value="uz">UZ</option>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
            <select
              aria-label="Tema"
              value={theme}
              onChange={(event) => setTheme(event.target.value as ThemeMode)}
              className="form-select compact-select"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <span className="wallet-pill d-none d-sm-flex">
              <i className="bi bi-coin"></i> {wallet.tCoins}
            </span>
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
        <NavLink to="/User" end aria-label="Kurslar">
          <i className="bi bi-collection-play"></i>
          <span>Kurslar</span>
        </NavLink>
        <NavLink to="/User/Sourcecode" aria-label="Kod">
          <i className="bi bi-code-slash"></i>
          <span>Kod</span>
        </NavLink>
        <NavLink to="/ProfileU" aria-label="Dashboard">
          <i className="bi bi-speedometer2"></i>
          <span>Panel</span>
        </NavLink>
        <NavLink to="/ProfileU/AI" aria-label="AI Ustoz">
          <i className="bi bi-stars"></i>
          <span>AI</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default User;
