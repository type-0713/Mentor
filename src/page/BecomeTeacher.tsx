import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateUserMutation } from "../utils/api";
import { getCurrentUserId, requireRole } from "../utils/auth";
import "../index.css";

const BecomeTeacher = () => {
  const navigate = useNavigate();
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  async function switchRole() {
    const userId = getCurrentUserId();
    if (!userId) {
      navigate("/signUp");
      return;
    }

    try {
      await updateUser({ id: userId, Role: "teacher" }).unwrap();
      localStorage.setItem("role", "teacher");
      navigate("/Teacher");
    } catch {
      alert("Rolni yangilashda xatolik yuz berdi. Firebase ruxsatlarini tekshiring.");
    }
  }

  return (
    <div className="become-teacher-wrapper">
      <div className="mb-4">
        <h4 className="fw-bold text-dark">O'qituvchi maqomini olish</h4>
        <p className="text-muted small">
          Platformada kurslaringizni nashr qilish uchun quyidagi ma'lumotlarni tasdiqlang.
        </p>
      </div>

      <div className="row">
        <div className="col-12 col-lg-6">
          <div className="card border-0 bg-light p-4 rounded-4">
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">To'liq ismingiz (F.I.SH)</label>
              <input
                placeholder="Masalan: Ali Valiyev"
                className="form-control custom-input border-0"
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Telefon raqamingiz</label>
              <input
                placeholder="+998 90 123 45 67"
                className="form-control custom-input border-0"
              />
            </div>
            <div className="alert alert-warning border-0 rounded-3 small mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Davom etish tugmasini bossangiz, profilingiz o'qituvchi rejimiga o'tkaziladi.
            </div>
            <button
              onClick={switchRole}
              disabled={isLoading}
              className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm"
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-check2-circle me-2"></i>
              )}
              Tasdiqlash va davom etish
            </button>
          </div>
        </div>

        <div className="col-12 col-lg-6 d-none d-lg-block">
          <div className="ps-4 border-start h-100">
            <h6 className="fw-bold mb-3 text-primary">O'qituvchi bo'lishning afzalliklari:</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><i className="bi bi-check-lg text-success me-2"></i> Shaxsiy kurslarni yuklash imkoniyati</li>
              <li className="mb-2"><i className="bi bi-check-lg text-success me-2"></i> Talabalar bilan ishlash dashboardi</li>
              <li className="mb-2"><i className="bi bi-check-lg text-success me-2"></i> Manba kodlarini ulashish</li>
            </ul>
            <div className="mt-4">
              <i className="bi bi-person-workspace text-primary-subtle" style={{ fontSize: "100px" }}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeTeacher;
