import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCoursesQuery, useGetUsersQuery } from "../utils/api";
import { requireRole } from "../utils/auth";
import {
  PREMIUM_PRICE_COINS,
  SUPPORT_PHONE,
  TELEGRAM_CHANNEL_URL,
  buyPremiumWithCoins,
  claimDailyBonus,
  claimTelegramBonus,
  demoCourse,
  downloadCertificatePdf,
  getCertificates,
  getDashboardStats,
  getGames,
  getLanguage,
  getPosts,
  getRanking,
  getSessionUser,
  getWallet,
  hasPremium,
  likePost,
  spinLuckyWheel,
} from "../utils/platform";
import type { CourseRecord, UserRecord } from "../utils/types";
import "../index.css";

const dailyPlan = [
  "1-kun: 5 T-Coin",
  "2-kun: 10 T-Coin",
  "3-kun: 1 Spin Ticket",
  "4-kun: 10 T-Coin",
  "5-kun: 10 T-Coin",
  "6-kun: 15 T-Coin",
  "7-kun: 20 T-Coin",
];

const spinSectors = [
  "Hech narsa",
  "Hech narsa",
  "Hech narsa",
  "Hech narsa",
  "1 T-Coin",
  "1 T-Coin",
  "1 T-Coin",
  "2 T-Coin",
  "2 T-Coin",
  "3 kun Premium",
];

const About1 = () => {
  const navigate = useNavigate();
  const { data: courseData = [] } = useCoursesQuery("");
  const { data: usersData = [] } = useGetUsersQuery("");
  const [wallet, setWallet] = useState(() => getWallet());
  const [certificates, setCertificates] = useState(() => getCertificates());
  const [posts, setPosts] = useState(() => getPosts());
  const [message, setMessage] = useState("");
  const [spinLabel, setSpinLabel] = useState("");
  const session = getSessionUser();
  const language = getLanguage().toUpperCase();
  const courses = useMemo(() => {
    const items = courseData as CourseRecord[];
    return items.length ? items : [demoCourse];
  }, [courseData]);
  const ranking = getRanking(usersData as UserRecord[]);
  const stats = getDashboardStats(courses);
  const currentRank = ranking.find((item) => item.isCurrent)?.rank || stats.rank;
  const premiumActive = hasPremium(wallet);
  const games = getGames();

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  const refresh = () => {
    setWallet(getWallet());
    setCertificates(getCertificates());
    setPosts(getPosts());
  };

  const handleDailyBonus = () => {
    const result = claimDailyBonus();
    setWallet(result.wallet);
    setMessage(result.message);
  };

  const handleSpin = () => {
    const result = spinLuckyWheel();
    setWallet(result.wallet);
    setSpinLabel(result.label);
    setMessage(result.ok ? `Lucky Spin: ${result.label}` : result.label);
  };

  const handlePremium = () => {
    const result = buyPremiumWithCoins();
    setWallet(result.wallet);
    setMessage(result.ok ? "Premium 7 kunga faollashdi." : `${PREMIUM_PRICE_COINS} T-Coin kerak.`);
  };

  const handleTelegramBonus = () => {
    window.open(TELEGRAM_CHANNEL_URL, "_blank", "noopener,noreferrer");
    const result = claimTelegramBonus();
    setWallet(result.wallet);
    setMessage(result.awarded ? "Telegram bonusi: 200 T-Coin qo'shildi." : "Telegram bonusi oldin olingan.");
  };

  const handleLike = (postId: string) => {
    setPosts(likePost(postId));
  };

  return (
    <div className="dashboard-premium">
      <section className="dashboard-hero mb-4">
        <div>
          <span className="section-kicker">Mentor.uz Dashboard / {language}</span>
          <h1>Salom, {session.name}</h1>
          <p>O'qish statistikasi, T-Coin mukofotlari, reyting va sertifikatlaringiz bir joyda.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/ProfileU/AI" className="btn btn-light rounded-pill px-4 fw-bold">
            <i className="bi bi-stars me-2"></i> AI Ustoz
          </Link>
          <a href={`tel:${SUPPORT_PHONE}`} className="btn btn-outline-light rounded-pill px-4 fw-bold">
            <i className="bi bi-headset me-2"></i> Admin bilan bog'lanish
          </a>
        </div>
      </section>

      {message && (
        <div className="alert mentor-alert border-0 rounded-4 d-flex align-items-center gap-2">
          <i className="bi bi-info-circle"></i>
          <span>{message}</span>
        </div>
      )}

      <div className="stats-grid mb-4">
        <div className="stat-tile">
          <span>Kunlik o'qish</span>
          <strong>{stats.dailyMinutes} daq</strong>
          <small>Bugungi faoliyat</small>
        </div>
        <div className="stat-tile">
          <span>Haftalik</span>
          <strong>{stats.weeklyPercent}%</strong>
          <small>O'rtacha progress</small>
        </div>
        <div className="stat-tile">
          <span>Oylik</span>
          <strong>{stats.monthlyPercent}%</strong>
          <small>O'sish ko'rsatkichi</small>
        </div>
        <div className="stat-tile">
          <span>Umumiy soat</span>
          <strong>{stats.totalStudyHours}</strong>
          <small>O'qilgan vaqt</small>
        </div>
        <div className="stat-tile">
          <span>Tugatilgan kurs</span>
          <strong>{stats.completedCourses}</strong>
          <small>Yakunlanganlar</small>
        </div>
        <div className="stat-tile">
          <span>Sertifikat</span>
          <strong>{stats.certificatesCount}</strong>
          <small>Profil arxivi</small>
        </div>
        <div className="stat-tile accent">
          <span>T-Coin</span>
          <strong>{wallet.tCoins}</strong>
          <small>Balans</small>
        </div>
        <div className="stat-tile">
          <span>Reyting</span>
          <strong>#{currentRank}</strong>
          <small>TOP 100 ichida</small>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <section className="premium-panel mb-4">
            <div className="panel-header d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <span className="section-kicker">T-Coin va bonuslar</span>
                <h2>Kunlik bonus va Lucky Spin</h2>
              </div>
              <span className="wallet-pill"><i className="bi bi-ticket-perforated"></i> {wallet.spinTickets} ticket</span>
            </div>

            <div className="daily-bonus-grid mb-4">
              {dailyPlan.map((item, index) => (
                <div className={`daily-bonus ${wallet.loginStreak === index + 1 ? "active" : ""}`} key={item}>
                  <strong>{index + 1}</strong>
                  <span>{item.split(": ")[1]}</span>
                </div>
              ))}
              <div className="daily-bonus">
                <strong>8+</strong>
                <span>Har kuni 5 T-Coin</span>
              </div>
            </div>

            <div className="bonus-actions">
              <button onClick={handleDailyBonus} className="btn btn-mentor-primary rounded-pill px-4">
                <i className="bi bi-gift me-2"></i> Kunlik bonusni olish
              </button>
              <button onClick={handleSpin} className="btn btn-outline-dark rounded-pill px-4">
                <i className="bi bi-arrow-repeat me-2"></i> Lucky Spin
              </button>
              <button onClick={handleTelegramBonus} className="btn btn-outline-info rounded-pill px-4">
                <i className="bi bi-telegram me-2"></i> Telegram 200 T-Coin
              </button>
            </div>

            <div className="spin-board mt-4">
              {spinSectors.map((sector, index) => (
                <span className={spinLabel === sector ? "active" : ""} key={`${sector}-${index}`}>
                  {sector}
                </span>
              ))}
            </div>
          </section>

          <section className="premium-panel mb-4">
            <div className="panel-header d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <span className="section-kicker">Certificates</span>
                <h2>Sertifikatlar arxivi</h2>
              </div>
              <button onClick={refresh} className="icon-button" aria-label="Yangilash">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            {certificates.length ? (
              <div className="certificate-list">
                {certificates.map((certificate) => (
                  <div className="certificate-row" key={certificate.id}>
                    <div>
                      <strong>{certificate.courseName}</strong>
                      <span>{certificate.firstName} {certificate.lastName} / {certificate.scorePercent}%</span>
                    </div>
                    <button onClick={() => downloadCertificatePdf(certificate)} className="btn btn-outline-dark btn-sm rounded-pill">
                      <i className="bi bi-filetype-pdf me-1"></i> PDF
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-premium">
                <i className="bi bi-award"></i>
                <strong>Hali sertifikat yo'q</strong>
                <span>Kursni yakunlab, testdan o'tganingizdan keyin avtomatik saqlanadi.</span>
              </div>
            )}
          </section>

          <section className="premium-panel">
            <div className="panel-header">
              <span className="section-kicker">Postlar va o'yinlar</span>
              <h2>Real-time hamjamiyat oqimi</h2>
            </div>
            <div className="community-grid">
              {posts.map((post) => (
                <article className="community-post" key={post.id}>
                  <img src={post.imageUrl} alt={post.title} />
                  <div>
                    <strong>{post.title}</strong>
                    <p>{post.description}</p>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <button onClick={() => handleLike(post.id)} className="btn btn-sm btn-outline-danger rounded-pill">
                        <i className="bi bi-heart me-1"></i> {post.likes}
                      </button>
                      <span className="soft-badge">{post.comments.length} comment</span>
                    </div>
                  </div>
                </article>
              ))}
              {games.map((game) => (
                <article className="community-post" key={game.id}>
                  <img src={game.imageUrl} alt={game.name} />
                  <div>
                    <strong>{game.name}</strong>
                    <p>{game.description}</p>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className="soft-badge">{game.questionCount} savol</span>
                      <span className="soft-badge">+{game.rewardCoins} T-Coin</span>
                      <span className="soft-badge">{game.timerSeconds}s</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-4">
          <section className={`premium-upgrade mb-4 ${premiumActive ? "active" : ""}`}>
            <span className="section-kicker">Premium</span>
            <h2>{premiumActive ? "Premium faol" : "Premiumni oching"}</h2>
            <p>
              AI Teacher, premium chat, maxsus kurslar, badge, reklamasiz tajriba va premium sertifikat dizayni.
            </p>
            <div className="premium-price">{PREMIUM_PRICE_COINS} T-Coin / 7 kun</div>
            <button onClick={handlePremium} className="btn btn-light rounded-pill px-4 fw-bold">
              <i className="bi bi-stars me-2"></i> {premiumActive ? "Muddatni uzaytirish" : "Premium olish"}
            </button>
            {wallet.premiumUntil && <small>Amal qilish muddati: {new Date(wallet.premiumUntil).toLocaleDateString("uz-UZ")}</small>}
          </section>

          <section className="premium-panel mb-4">
            <div className="panel-header">
              <span className="section-kicker">TOP 100</span>
              <h2>Reyting</h2>
            </div>
            <div className="leaderboard-list">
              {ranking.slice(0, 6).map((entry) => (
                <div className={`leaderboard-row ${entry.isCurrent ? "current" : ""}`} key={entry.id}>
                  <span>#{entry.rank}</span>
                  <strong>{entry.name}</strong>
                  <em>{entry.tCoins} TC</em>
                </div>
              ))}
            </div>
          </section>

          <section className="premium-panel">
            <div className="panel-header">
              <span className="section-kicker">Premium chat</span>
              <h2>AI Teacher</h2>
            </div>
            <p className="text-muted small">
              Savolingizni AI Ustozga yuboring. Hozirgi versiya lokal yordamchi mantiq bilan ishlaydi va API ulashga tayyor.
            </p>
            <Link to="/ProfileU/AI" className="btn btn-mentor-primary rounded-pill px-4 w-100">
              AI Ustozga o'tish
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About1;
