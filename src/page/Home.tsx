import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentRole } from "../utils/auth";
import { SUPPORT_PHONE, TELEGRAM_CHANNEL_URL } from "../utils/platform";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getCurrentRole();
    if (role === "admin") {
      navigate("/Admin");
    }

    if (role === "user") {
      navigate("/User");
    }

    if (role === "teacher") {
      navigate("/Teacher");
    }
  }, [navigate]);

  return (
    <div className="home-premium">
      <nav className="home-nav">
        <Link to="/" className="mentor-brand">
          <img src={logo} alt="Mentor.uz" />
          <span>Mentor.uz</span>
        </Link>
        <div className="d-flex gap-2 align-items-center">
          <Link className="btn btn-outline-dark rounded-pill px-4" to="/signIn">Sign In</Link>
          <Link className="btn btn-mentor-primary rounded-pill px-4" to="/signUp">Sign Up</Link>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-copy">
          <span className="section-kicker">IT ta'lim, test, sertifikat va T-Coin</span>
          <h1>Mentor.uz</h1>
          <p>
            Modulli kurslar, majburiy testlar, avtomatik sertifikatlar, Lucky Spin, reyting va premium AI Ustoz
            bilan o'qishni aniq natijaga bog'laydigan platforma.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <Link to="/signUp" className="btn btn-mentor-primary btn-lg rounded-pill px-5">
              O'qishni boshlash
            </Link>
            <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-lg rounded-pill px-5">
              <i className="bi bi-telegram me-2"></i> Telegram
            </a>
          </div>
          <div className="home-feature-row">
            <span><i className="bi bi-patch-check"></i> 70% pass test</span>
            <span><i className="bi bi-coin"></i> T-Coin rewards</span>
            <span><i className="bi bi-filetype-pdf"></i> PDF certificate</span>
          </div>
        </div>

        <div className="product-preview" aria-label="Mentor.uz dashboard preview">
          <div className="preview-top">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="preview-grid">
            <div className="preview-metric">
              <strong>86%</strong>
              <span>Haftalik progress</span>
            </div>
            <div className="preview-metric dark">
              <strong>250</strong>
              <span>T-Coin Premium</span>
            </div>
            <div className="preview-chart">
              <i style={{ height: "55%" }}></i>
              <i style={{ height: "78%" }}></i>
              <i style={{ height: "45%" }}></i>
              <i style={{ height: "92%" }}></i>
              <i style={{ height: "68%" }}></i>
            </div>
            <div className="preview-list">
              <span><b></b> AI Teacher</span>
              <span><b></b> Premium chat</span>
              <span><b></b> TOP 100 ranking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-strip">
        <span><i className="bi bi-person-video3"></i> O'qituvchi kurs yaratadi</span>
        <span><i className="bi bi-trophy"></i> Testdan o'tganlarga sertifikat</span>
        <span><i className="bi bi-headset"></i> Admin: {SUPPORT_PHONE}</span>
      </section>
    </div>
  );
};

export default Home;
