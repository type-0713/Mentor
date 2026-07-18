import { useEffect, useState } from "react";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import { Link, useNavigate } from "react-router-dom";
import { requireRole } from "../utils/auth";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

const About = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: JSON.parse(localStorage.getItem("name") || "\"Ism kiritilmagan\""),
    phone: JSON.parse(localStorage.getItem("phone") || "\"\""),
    email: JSON.parse(localStorage.getItem("email") || "\"\""),
  });

  useEffect(() => {
    if (!requireRole("teacher")) {
      navigate("/signUp");
    }
  }, [navigate]);

  const saveChanges = () => {
    localStorage.setItem("name", JSON.stringify(userData.name));
    localStorage.setItem("phone", JSON.stringify(userData.phone));
    localStorage.setItem("email", JSON.stringify(userData.email));
    setOpen(false);
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <header className="top-header mb-5 bg-white shadow-sm border-bottom p-3">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Link to="/Teacher">
              <img src={logo} alt="Mentor.uz" width={50} />
            </Link>
            <span className="text-muted d-none d-md-inline border-start ps-3">Profil</span>
          </div>
          <Link to="/Teacher" className="btn btn-outline-dark btn-sm rounded-pill px-4">
            <i className="bi bi-arrow-left me-1"></i> Orqaga
          </Link>
        </div>
      </header>

      <div className="teacher-profile-wrapper p-3">
        <div className="container mt-4">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="bg-primary py-4" style={{ height: "100px" }}></div>
                <div className="card-body text-center position-relative pt-0">
                  <div className="profile-img-container">
                    <img
                      src="https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png"
                      alt="profile"
                      className="rounded-circle border border-4 border-white shadow-sm mb-3 bg-white"
                      width="120"
                      height="120"
                    />
                  </div>
                  <h4 className="fw-bold text-dark mt-2">{userData.name}</h4>
                  <span className="badge bg-dark-subtle text-dark rounded-pill px-3 mb-4">Mentor / O'qituvchi</span>

                  <div className="text-start bg-light p-3 rounded-3 mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-envelope text-primary me-3"></i>
                      <span className="text-muted small">Email:</span>
                      <span className="ms-auto fw-medium small">{userData.email || "Kiritilmagan"}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-telephone text-primary me-3"></i>
                      <span className="text-muted small">Telefon:</span>
                      <span className="ms-auto fw-medium small">{userData.phone || "Kiritilmagan"}</span>
                    </div>
                  </div>

                  <button onClick={() => setOpen(true)} className="btn btn-primary w-100 rounded-pill py-2 fw-bold">
                    <i className="bi bi-pencil-square me-2"></i> Profilni tahrirlash
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Rodal
          visible={open}
          onClose={() => setOpen(false)}
          height={350}
          customStyles={{ borderRadius: "20px", padding: "25px" }}
        >
          <div className="modal-content-custom">
            <h5 className="fw-bold mb-4">Ma'lumotlarni yangilash</h5>

            <div className="mb-3">
              <label className="x-small fw-bold text-muted mb-1">ISMINGIZ</label>
              <input
                value={userData.name}
                onChange={(event) => setUserData({ ...userData, name: event.target.value })}
                placeholder="Ism..."
                className="form-control custom-input"
                type="text"
              />
            </div>

            <div className="mb-3">
              <label className="x-small fw-bold text-muted mb-1">EMAIL</label>
              <input
                value={userData.email}
                onChange={(event) => setUserData({ ...userData, email: event.target.value })}
                placeholder="Email..."
                className="form-control custom-input"
                type="text"
              />
            </div>

            <div className="mb-4">
              <label className="x-small fw-bold text-muted mb-1">TELEFON</label>
              <input
                value={userData.phone}
                onChange={(event) => setUserData({ ...userData, phone: event.target.value })}
                placeholder="Phone..."
                className="form-control custom-input"
                type="text"
              />
            </div>
            <button onClick={saveChanges} className="btn btn-dark w-100 py-2 rounded-3 fw-bold">
              O'zgarishlarni saqlash
            </button>
          </div>
        </Rodal>
      </div>
    </div>
  );
};

export default About;
