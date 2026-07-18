import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCodesQuery, useCoursesQuery, useDelCodeMutation, useDelCourseMutation } from "../utils/api";
import { clearSession, getCurrentUserId, requireRole } from "../utils/auth";
import { clampNumber, getGames, getPosts, getSessionUser, saveGame, savePost } from "../utils/platform";
import type { CodeRecord, CourseRecord } from "../utils/types";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

const Teacher = () => {
  const navigate = useNavigate();
  const session = getSessionUser();
  const { data: courses = [], isLoading: loadCourse } = useCoursesQuery("");
  const { data: codes = [], isLoading: loadCode } = useCodesQuery("");
  const [deleteCourse, { isLoading: isDeletingCourse }] = useDelCourseMutation();
  const [deleteCode, { isLoading: isDeletingCode }] = useDelCodeMutation();
  const [posts, setPosts] = useState(() => getPosts());
  const [games, setGames] = useState(() => getGames());
  const [postForm, setPostForm] = useState({ title: "", description: "", imageUrl: "" });
  const [gameForm, setGameForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    questionCount: 10,
    rewardCoins: 3,
    timerSeconds: 60,
  });
  const [studioMessage, setStudioMessage] = useState("");

  useEffect(() => {
    if (!requireRole("teacher")) {
      navigate("/signUp");
    }
  }, [navigate]);

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm("Haqiqatan ham ushbu kursni o'chirmoqchimisiz?")) {
      try {
        await deleteCourse(id).unwrap();
      } catch {
        alert("Kursni o'chirishda xatolik!");
      }
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (window.confirm("Haqiqatan ham ushbu kod manbasini o'chirmoqchimisiz?")) {
      try {
        await deleteCode(id).unwrap();
      } catch {
        alert("Kod manbasini o'chirishda xatolik!");
      }
    }
  };

  const logout = () => {
    clearSession();
    navigate("/");
  };

  const createPost = () => {
    if (!postForm.title.trim() || !postForm.description.trim() || !postForm.imageUrl.trim()) {
      setStudioMessage("Post uchun rasm, sarlavha va tavsif kerak.");
      return;
    }

    const post = savePost({
      title: postForm.title.trim(),
      description: postForm.description.trim(),
      imageUrl: postForm.imageUrl.trim(),
      authorName: session.name,
    });
    setPosts([post, ...posts]);
    setPostForm({ title: "", description: "", imageUrl: "" });
    setStudioMessage("Post hamjamiyat oqimiga qo'shildi.");
  };

  const createGame = () => {
    if (!gameForm.name.trim() || !gameForm.description.trim() || !gameForm.imageUrl.trim()) {
      setStudioMessage("O'yin uchun rasm, nom va tavsif kerak.");
      return;
    }

    const game = saveGame({
      name: gameForm.name.trim(),
      description: gameForm.description.trim(),
      imageUrl: gameForm.imageUrl.trim(),
      questionCount: clampNumber(gameForm.questionCount, 1, 50),
      rewardCoins: clampNumber(gameForm.rewardCoins, 1, 5),
      timerSeconds: clampNumber(gameForm.timerSeconds, 10, 300),
      teacherId: getCurrentUserId(),
    });
    setGames([game, ...games]);
    setGameForm({ name: "", description: "", imageUrl: "", questionCount: 10, rewardCoins: 3, timerSeconds: 60 });
    setStudioMessage("O'yin o'quvchilar dashboardiga qo'shildi.");
  };

  if (loadCourse || loadCode) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const teacherId = getCurrentUserId();
  const myCourses = (courses as CourseRecord[]).filter((item) => String(item.Id || "") === teacherId);
  const myCodes = (codes as CodeRecord[]).filter((code) => String(code.Id || "") === teacherId);

  return (
    <div className="container-fluid p-0 d-flex bg-light min-vh-100">
      <aside className="sidebar-container d-none d-md-flex flex-column p-3 bg-white shadow-sm">
        <div className="mb-4 ps-2 text-center">
          <Link to="/Teacher">
            <img src={logo} alt="Logo" width={60} className="rounded-circle shadow-sm" />
          </Link>
        </div>
        <div className="flex-grow-1">
          <div className="menu-label text-uppercase small fw-bold text-muted mb-3 text-center">Panel</div>
          <nav className="d-flex flex-column gap-1">
            <NavLink to="/Teacher" end className="nav-item-custom text-decoration-none p-2 rounded">
              <i className="bi bi-grid-1x2 me-2"></i> Mening kurslarim
            </NavLink>
            <NavLink to="/ProfileT" className="nav-item-custom text-decoration-none p-2 rounded">
              <i className="bi bi-person-badge me-2"></i> Profil
            </NavLink>
            <NavLink to="/Course" className="nav-item-custom text-decoration-none p-2 rounded">
              <i className="bi bi-plus-circle me-2"></i> Kurs qo'shish
            </NavLink>
            <NavLink to="/Code" className="nav-item-custom text-decoration-none p-2 rounded">
              <i className="bi bi-file-earmark-code me-2"></i> Kod qo'shish
            </NavLink>
          </nav>
        </div>
      </aside>

      <div className="flex-grow-1 d-flex flex-column">
        <header className="top-header px-4 d-flex justify-content-between align-items-center bg-white shadow-sm" style={{ height: "70px" }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-person-workspace fs-4 text-primary"></i>
            <span className="fw-bold text-dark fs-5">O'qituvchi boshqaruvi</span>
          </div>
          <button onClick={logout} className="btn btn-outline-danger btn-sm rounded px-3">
            Chiqish <i className="bi bi-box-arrow-right ms-1"></i>
          </button>
        </header>

        <main className="p-4 flex-grow-1">
          <div className="container-fluid">
            {studioMessage && <div className="alert mentor-alert border-0 rounded-4 mb-4">{studioMessage}</div>}
            <h4 className="fw-bold mb-4">Yuklangan kurslar ({myCourses.length})</h4>
            <div className="row g-4 mb-5">
              {myCourses.map((item) => (
                <div key={item.id} className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden">
                    <img src={item.Img} className="card-img-top" style={{ height: "150px", objectFit: "cover" }} alt={item.Lesson} />
                    <div className="card-body p-3">
                      <h6 className="fw-bold text-dark mb-3 text-truncate">{item.Lesson}</h6>
                      <button
                        onClick={() => handleDeleteCourse(item.id)}
                        disabled={isDeletingCourse}
                        className="btn btn-danger btn-sm w-100 mt-auto"
                      >
                        {isDeletingCourse ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-trash"></i> O'chirish</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {myCourses.length === 0 && <p className="text-muted ps-3">Hali kurslar yuklanmagan.</p>}
            </div>

            <hr />
            <h4 className="fw-bold mb-4 mt-5">Yuklangan kod manbalari ({myCodes.length})</h4>
            <div className="row g-4">
              {myCodes.map((code) => (
                <div key={code.id} className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden">
                    <div style={{ height: "150px", backgroundColor: "#f8f9fa" }} className="d-flex align-items-center justify-content-center">
                      {code.Img ? (
                        <img src={code.Img} className="w-100 h-100" style={{ objectFit: "cover" }} alt={code.Code || "Loyiha rasmi"} />
                      ) : (
                        <i className="bi bi-file-earmark-code fs-1 text-secondary"></i>
                      )}
                    </div>
                    <div className="card-body p-3">
                      <h6 className="fw-bold text-dark mb-3 text-truncate">{code.Code || "Loyiha kodi"}</h6>
                      <button
                        onClick={() => handleDeleteCode(code.id)}
                        disabled={isDeletingCode}
                        className="btn btn-danger btn-sm w-100 mt-auto"
                      >
                        {isDeletingCode ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <><i className="bi bi-trash"></i> O'chirish</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {myCodes.length === 0 && <p className="text-muted ps-3">Hali kodlar yuklanmagan.</p>}
            </div>

            <hr className="my-5" />
            <div className="row g-4">
              <div className="col-12 col-xl-6">
                <section className="premium-panel h-100">
                  <div className="panel-header">
                    <span className="section-kicker">Post Studio</span>
                    <h2>O'quvchilar uchun post</h2>
                  </div>
                  <input
                    value={postForm.title}
                    onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))}
                    className="form-control mentor-input mb-3"
                    placeholder="Sarlavha"
                  />
                  <input
                    value={postForm.imageUrl}
                    onChange={(event) => setPostForm((current) => ({ ...current, imageUrl: event.target.value }))}
                    className="form-control mentor-input mb-3"
                    placeholder="Rasm URL"
                  />
                  <textarea
                    value={postForm.description}
                    onChange={(event) => setPostForm((current) => ({ ...current, description: event.target.value }))}
                    className="form-control mentor-input mb-3"
                    rows={3}
                    placeholder="Tavsif"
                  />
                  <button onClick={createPost} className="btn btn-mentor-primary rounded-pill px-4">
                    <i className="bi bi-send me-2"></i> Post joylash
                  </button>
                  <div className="soft-badge mt-3">{posts.length} ta post</div>
                </section>
              </div>

              <div className="col-12 col-xl-6">
                <section className="premium-panel h-100">
                  <div className="panel-header">
                    <span className="section-kicker">Game Studio</span>
                    <h2>T-Coin mukofotli o'yin</h2>
                  </div>
                  <input
                    value={gameForm.name}
                    onChange={(event) => setGameForm((current) => ({ ...current, name: event.target.value }))}
                    className="form-control mentor-input mb-3"
                    placeholder="O'yin nomi"
                  />
                  <input
                    value={gameForm.imageUrl}
                    onChange={(event) => setGameForm((current) => ({ ...current, imageUrl: event.target.value }))}
                    className="form-control mentor-input mb-3"
                    placeholder="Rasm URL"
                  />
                  <textarea
                    value={gameForm.description}
                    onChange={(event) => setGameForm((current) => ({ ...current, description: event.target.value }))}
                    className="form-control mentor-input mb-3"
                    rows={2}
                    placeholder="Tavsif"
                  />
                  <div className="row g-3 mb-3">
                    <div className="col-sm-4">
                      <label className="form-label small fw-semibold">Savollar</label>
                      <input
                        value={gameForm.questionCount}
                        onChange={(event) =>
                          setGameForm((current) => ({ ...current, questionCount: clampNumber(Number(event.target.value) || 1, 1, 50) }))
                        }
                        type="number"
                        min={1}
                        max={50}
                        className="form-control mentor-input"
                      />
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label small fw-semibold">Mukofot</label>
                      <input
                        value={gameForm.rewardCoins}
                        onChange={(event) =>
                          setGameForm((current) => ({ ...current, rewardCoins: clampNumber(Number(event.target.value) || 1, 1, 5) }))
                        }
                        type="number"
                        min={1}
                        max={5}
                        className="form-control mentor-input"
                      />
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label small fw-semibold">Taymer</label>
                      <input
                        value={gameForm.timerSeconds}
                        onChange={(event) =>
                          setGameForm((current) => ({ ...current, timerSeconds: clampNumber(Number(event.target.value) || 10, 10, 300) }))
                        }
                        type="number"
                        min={10}
                        max={300}
                        className="form-control mentor-input"
                      />
                    </div>
                  </div>
                  <button onClick={createGame} className="btn btn-outline-dark rounded-pill px-4">
                    <i className="bi bi-controller me-2"></i> O'yin yaratish
                  </button>
                  <div className="soft-badge mt-3">{games.length} ta o'yin</div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Teacher;
