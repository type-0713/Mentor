import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetUsersQuery, useUpdateUserMutation } from "../utils/api";
import { requireRole } from "../utils/auth";
import { ADMIN_EMAIL_PREFIX, getRanking } from "../utils/platform";
import type { UserRecord } from "../utils/types";
import "../index.css";

const addDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

const Admin = () => {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetUsersQuery("");
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [coinAmount, setCoinAmount] = useState(10);
  const [message, setMessage] = useState("");
  const [now] = useState(() => Date.now());
  const users = data as UserRecord[];
  const ranking = useMemo(() => getRanking(users), [users]);
  const teachers = users.filter((user) => user.Role === "teacher");
  const premiumUsers = users.filter((user) => user.premiumUntil && new Date(user.premiumUntil).getTime() > now);

  useEffect(() => {
    if (!requireRole("admin")) {
      navigate("/signIn");
    }
  }, [navigate]);

  const mutateUser = async (user: UserRecord, payload: Partial<UserRecord>, successMessage: string) => {
    try {
      await updateUser({ id: user.id, ...payload }).unwrap();
      setMessage(successMessage);
    } catch {
      setMessage("Firebase ruxsatlari yoki internet ulanishi sababli amal bajarilmadi.");
    }
  };

  const changeCoins = (user: UserRecord, direction: "add" | "subtract") => {
    const current = Number(user.tCoins || 0);
    const amount = Math.max(1, Number(coinAmount) || 1);
    const nextAmount = direction === "add" ? current + amount : Math.max(0, current - amount);
    void mutateUser(user, { tCoins: nextAmount }, `${user.name || user.Email} balansi yangilandi.`);
  };

  if (isLoading) {
    return (
      <div className="mentor-shell min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="mentor-shell min-vh-100">
      <header className="mentor-topbar sticky-top">
        <div className="container-fluid px-3 px-lg-4 d-flex justify-content-between align-items-center">
          <div>
            <span className="section-kicker">Admin / {ADMIN_EMAIL_PREFIX}</span>
            <h1 className="topbar-title">Mentor.uz boshqaruv paneli</h1>
          </div>
          <Link to="/ProfileU" className="btn btn-outline-dark rounded-pill px-4">
            <i className="bi bi-arrow-left me-2"></i> Dashboard
          </Link>
        </div>
      </header>

      <main className="container-fluid px-3 px-lg-4 py-4">
        {message && <div className="alert mentor-alert border-0 rounded-4">{message}</div>}
        {isError && <div className="alert alert-danger border-0 rounded-4">Foydalanuvchilarni yuklashda xatolik.</div>}

        <div className="stats-grid mb-4">
          <div className="stat-tile">
            <span>Foydalanuvchilar</span>
            <strong>{users.length}</strong>
            <small>Jami hisoblar</small>
          </div>
          <div className="stat-tile">
            <span>O'qituvchilar</span>
            <strong>{teachers.length}</strong>
            <small>Tasdiqlash navbati</small>
          </div>
          <div className="stat-tile accent">
            <span>Premium</span>
            <strong>{premiumUsers.length}</strong>
            <small>Faol obunalar</small>
          </div>
          <div className="stat-tile">
            <span>TOP balans</span>
            <strong>{ranking[0]?.tCoins || 0}</strong>
            <small>T-Coin</small>
          </div>
        </div>

        <section className="premium-panel mb-4">
          <div className="panel-header d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <span className="section-kicker">Teacher approvals</span>
              <h2>O'qituvchilarni tasdiqlash yoki rad etish</h2>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ism</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.name || "Nomsiz"}</td>
                    <td>{teacher.Email || "Email yo'q"}</td>
                    <td><span className="soft-badge">{teacher.status || "pending"}</span></td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          onClick={() => mutateUser(teacher, { status: "approved" }, "O'qituvchi tasdiqlandi.")}
                          disabled={isUpdating}
                          className="btn btn-sm btn-success rounded-pill"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => mutateUser(teacher, { status: "rejected", Role: "user" }, "O'qituvchi rad etildi.")}
                          disabled={isUpdating}
                          className="btn btn-sm btn-outline-danger rounded-pill"
                        >
                          Rad etish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!teachers.length && (
                  <tr>
                    <td colSpan={4}>Hozircha o'qituvchi arizalari yo'q.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="premium-panel">
          <div className="panel-header d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <span className="section-kicker">Users</span>
              <h2>Barcha foydalanuvchilar jadvali</h2>
            </div>
            <label className="compact-field">
              <span>T-Coin</span>
              <input value={coinAmount} onChange={(event) => setCoinAmount(Number(event.target.value) || 1)} type="number" min={1} />
            </label>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foydalanuvchi</th>
                  <th>Rol</th>
                  <th>T-Coin</th>
                  <th>Premium</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const premiumActive = Boolean(user.premiumUntil && new Date(user.premiumUntil).getTime() > now);

                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name || user.Email || "Nomsiz"}</strong>
                        <span>{user.Phone || "Telefon yo'q"}</span>
                      </td>
                      <td>{user.Role || "user"}</td>
                      <td>{Number(user.tCoins || 0)}</td>
                      <td>{premiumActive ? new Date(user.premiumUntil || "").toLocaleDateString("uz-UZ") : "Yo'q"}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button onClick={() => changeCoins(user, "add")} disabled={isUpdating} className="btn btn-sm btn-outline-success rounded-pill">
                            + T-Coin
                          </button>
                          <button onClick={() => changeCoins(user, "subtract")} disabled={isUpdating} className="btn btn-sm btn-outline-warning rounded-pill">
                            - T-Coin
                          </button>
                          <button
                            onClick={() =>
                              mutateUser(user, { premiumUntil: addDays(7), premiumBadge: true }, "Premium 7 kunga berildi.")
                            }
                            disabled={isUpdating}
                            className="btn btn-sm btn-outline-primary rounded-pill"
                          >
                            Premium berish
                          </button>
                          <button
                            onClick={() => mutateUser(user, { premiumUntil: "", premiumBadge: false }, "Premium bekor qilindi.")}
                            disabled={isUpdating}
                            className="btn btn-sm btn-outline-danger rounded-pill"
                          >
                            Bekor qilish
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!users.length && (
                  <tr>
                    <td colSpan={5}>Firebase users collection bo'sh.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
