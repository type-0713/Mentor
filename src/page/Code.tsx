import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCodesQuery } from "../utils/api";
import { requireRole } from "../utils/auth";
import type { CodeRecord } from "../utils/types";
import "../index.css";

const Sourcecode = () => {
  const navigate = useNavigate();
  const { data = [], isError, isLoading } = useCodesQuery("");
  const codes = data as CodeRecord[];

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  if (isError) {
    return <h2 className="text-center mt-5 text-danger">Manba kodlarni yuklashda xatolik...</h2>;
  }

  function handleClick(item: CodeRecord) {
    sessionStorage.setItem("selectedCode", JSON.stringify(item));
    navigate("/User/Sourcecodes");
  }

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
        <div>
          <h4 className="fw-bold m-0 text-dark">Loyiha manba kodlari</h4>
          <p className="text-muted small m-0">Tayyor loyihalar kodi va resurslari</p>
        </div>
        <div className="badge bg-info-subtle text-info px-3 py-2 rounded-pill">
          Jami: {codes.length} ta loyiha
        </div>
      </div>

      <div className="row g-4">
        {codes.map((item) => (
          <div
            key={item.id}
            className="col-12 col-sm-6 col-md-4 col-lg-3"
            onClick={() => handleClick(item)}
            style={{ cursor: "pointer" }}
          >
            <div className="card h-100 border-0 shadow-sm code-card-user">
              <div className="code-card-img-wrapper position-relative">
                <img
                  src={item.Img}
                  alt={item.Code}
                  className="code-card-img"
                />
                <div className="source-tag-blue">Source</div>
              </div>
              <div className="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <h6 className="fw-bold text-dark mb-1 text-truncate">{item.Code}</h6>
                  <p className="text-muted x-small mb-3 line-clamp-2">
                    {item.Dec || "Loyiha manba kodi bilan tanishish."}
                  </p>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-event x-small text-muted"></i>
                    <span className="x-small text-muted">{item.Day || "Sana kiritilmagan"}</span>
                  </div>
                  <div className="btn-action-diamond rounded">
                    <i className="bi bi-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {codes.length === 0 && (
          <div className="col-12">
            <div className="empty-state text-center py-5">
              <i className="bi bi-file-earmark-code text-info display-5"></i>
              <h5 className="fw-bold mt-3">Hali manba kodlar yo'q</h5>
              <p className="text-muted small mb-0">Yangi loyiha qo'shilganda shu yerda ko'rinadi.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sourcecode;
