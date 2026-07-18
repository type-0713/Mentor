import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCodeMutation } from "../utils/api";
import { getCurrentUserId, requireRole } from "../utils/auth";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

type CodeForm = {
    Code: string;
    Dec: string;
    Day: string;
    Img: string;
    Video: string;
    Count: string;
};

const TCode = () => {
    const [addCodes, { isLoading }] = useCodeMutation();
    const navigate = useNavigate();
    const [form, setForm] = useState<CodeForm>({
        Code: "",
        Dec: "",
        Day: "",
        Img: "",
        Video: "",
        Count: "",
    });

    useEffect(() => {
        if (!requireRole("teacher")) {
            navigate("/signUp");
        }
    }, [navigate]);

    const updateField = (field: keyof CodeForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    async function addCode() {
        const teacherId = getCurrentUserId();
        const payload = {
            ...form,
            Id: teacherId,
            Count: Number(form.Count) || 0,
        };

        if (!payload.Code || !payload.Dec || !payload.Day || !payload.Img || !payload.Video) {
            alert("Iltimos, loyiha uchun barcha maydonlarni to'ldiring.");
            return;
        }

        try {
            await addCodes(payload).unwrap();
            navigate("/Teacher");
        } catch {
            alert("Loyihani saqlashda xatolik yuz berdi. Firebase ruxsatlarini tekshiring.");
        }
    }

    return (
        <div className="bg-light min-vh-100 pb-5">
            <header className="top-header mb-5 bg-white shadow-sm border-bottom p-3">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/Teacher">
                            <img src={logo} alt="Mentor.uz" width={50} />
                        </Link>
                        <span className="text-muted d-none d-md-inline border-start ps-3">Manba kodi qo'shish</span>
                    </div>
                    <Link to="/Teacher" className="btn btn-outline-dark btn-sm rounded-pill px-4">
                        <i className="bi bi-arrow-left me-1"></i> Orqaga
                    </Link>
                </div>
            </header>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
                            <div className="text-center mb-4">
                                <div className="icon-circle bg-primary-subtle text-primary mb-3 mx-auto">
                                    <i className="bi bi-cloud-arrow-up fs-3"></i>
                                </div>
                                <h3 className="fw-bold">Yangi loyiha</h3>
                                <p className="text-muted small">Loyiha kodi, linki va darslar sonini kiriting</p>
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold small text-secondary">Loyiha sarlavhasi</label>
                                <input
                                    value={form.Code}
                                    onChange={(event) => updateField("Code", event.target.value)}
                                    placeholder="Masalan: React Dashboard"
                                    type="text"
                                    className="form-control custom-input"
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold small text-secondary">Rasm URL (Preview)</label>
                                <input
                                    value={form.Img}
                                    onChange={(event) => updateField("Img", event.target.value)}
                                    placeholder="https://image-link.com/preview.png"
                                    type="text"
                                    className="form-control custom-input"
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold small text-primary">
                                    <i className="bi bi-github me-2"></i>GitHubdagi loyiha linki
                                </label>
                                <input
                                    value={form.Video}
                                    onChange={(event) => updateField("Video", event.target.value)}
                                    placeholder="GitHubdagi loyihangizni kiriting"
                                    type="text"
                                    className="form-control custom-input border-primary-subtle"
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold small text-secondary">Yuklangan sana</label>
                                    <input
                                        value={form.Day}
                                        onChange={(event) => updateField("Day", event.target.value)}
                                        type="date"
                                        className="form-control custom-input"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold small text-secondary">Darslar soni</label>
                                    <input
                                        value={form.Count}
                                        onChange={(event) => updateField("Count", event.target.value)}
                                        placeholder="Masalan: 12"
                                        type="number"
                                        className="form-control custom-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label fw-bold small text-secondary">Tavsif</label>
                                <input
                                    value={form.Dec}
                                    onChange={(event) => updateField("Dec", event.target.value)}
                                    placeholder="Loyiha haqida qisqacha..."
                                    type="text"
                                    className="form-control custom-input"
                                />
                            </div>
                            <button
                                onClick={addCode}
                                className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mt-3"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                ) : (
                                    <i className="bi bi-check-circle me-2"></i>
                                )}
                                Loyihani nashr qilish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TCode;
