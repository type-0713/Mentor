import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requireRole } from "../utils/auth";
import type { CodeRecord } from "../utils/types";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

const getSelectedCode = (): CodeRecord | null => {
  try {
    return JSON.parse(sessionStorage.getItem("selectedCode") || "null");
  } catch {
    return null;
  }
};

const AbouteS = () => {
  const navigate = useNavigate();
  const selectedCode = getSelectedCode();

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  function clearSelection() {
    sessionStorage.removeItem("selectedCode");
  }

  return (
    <div className="bg-light min-vh-100">
      <header className="top-header mb-4 bg-white shadow-sm border-bottom">
        <div className="container d-flex justify-content-between align-items-center py-2">
          <Link onClick={clearSelection} to="/User" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
            <img width={50} src={logo} alt="logo" />
          </Link>
          <Link onClick={clearSelection} to="/User/Sourcecode" className="btn btn-outline-dark btn-sm rounded-pill px-4 fw-bold">
            <i className="bi bi-arrow-left me-2"></i> Loyihalarga qaytish
          </Link>
        </div>
      </header>

      <div className="container py-4">
        {selectedCode ? (
          <div className="row g-5 align-items-center">
            <div className="col-12 col-lg-7">
              <a href={selectedCode.Video} target="_blank" rel="noopener noreferrer" className="text-decoration-none d-block">
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative preview-card-hover">
                  <img
                    src={selectedCode.Img}
                    alt={selectedCode.Code || "Project preview"}
                    className="img-fluid w-100 object-fit-cover detail-preview-img"
                  />
                  {selectedCode.Video && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <div className="play-button-pulse bg-white bg-opacity-90 rounded-circle d-flex align-items-center justify-content-center shadow-lg play-circle">
                        <i className="bi bi-play-fill text-info fs-1"></i>
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-info text-white text-center small fw-bold">
                    <i className="bi bi-eye me-2"></i> Loyiha videosi yoki demo ko'rinishini tomosha qiling
                  </div>
                </div>
              </a>
            </div>

            <div className="col-12 col-lg-5">
              <div className="ps-lg-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-info-subtle text-info rounded-pill px-3">Manba kodi</span>
                  <span className="text-muted small"><i className="bi bi-calendar3 me-1"></i> {selectedCode.Day || "Sana kiritilmagan"}</span>
                </div>
                <h1 className="fw-bold mb-3 display-6 text-dark">{selectedCode.Code || "Nomsiz loyiha"}</h1>
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border-start border-info border-4">
                  <h5 className="fw-bold mb-3 d-flex align-items-center">
                    <i className="bi bi-info-circle me-2 text-info"></i> Loyiha tavsifi
                  </h5>
                  <p className="text-secondary mb-0" style={{ lineHeight: "1.8", fontSize: "1.05rem" }}>
                    {selectedCode.Dec || "Ushbu loyiha haqida batafsil ma'lumot berilmagan."}
                  </p>
                </div>
                <a
                  href={selectedCode.Video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-info btn-lg rounded-pill py-3 fw-bold text-white shadow-sm w-100 ${!selectedCode.Video ? "disabled" : ""}`}
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>
                  {selectedCode.Video ? "Loyiha linkini ochish" : "Link mavjud emas"}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 mt-5">
            <div className="mb-4">
              <i className="bi bi-folder-x text-muted" style={{ fontSize: "5rem" }}></i>
            </div>
            <h4 className="fw-bold">Loyiha tanlanmagan</h4>
            <p className="text-muted">Iltimos, manba kodlari bo'limidan loyihani tanlang.</p>
            <Link to="/User/Sourcecode" className="btn btn-info text-white mt-3 rounded-pill px-5 py-2 fw-bold">
              Ro'yxatga qaytish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbouteS;
