import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getAuthErrorMessage,
    loginWithEmail,
    loginWithSocialProvider,
    registerWithEmail,
    saveSession,
    type SocialProviderName,
    type UserRole,
} from "../utils/auth";
import "../index.css";

type SignUpForm = {
    name: string;
    Phone: string;
    Email: string;
    Password: string;
    Role: UserRole | "";
};

const socialProviders: Array<{ id: SocialProviderName; label: string; icon: string }> = [
    { id: "google", label: "Google", icon: "bi-google" },
    { id: "microsoft", label: "Microsoft", icon: "bi-microsoft" },
    { id: "apple", label: "Apple", icon: "bi-apple" },
];

const SignUp = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<SignUpForm>({
        name: "",
        Phone: "",
        Email: "",
        Password: "",
        Role: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState<SocialProviderName | null>(null);

    const navigateByRole = (role?: string) => {
        if (role === "admin") {
            navigate("/Admin");
            return;
        }

        navigate(role === "teacher" ? "/Teacher" : "/User");
    };

    const updateField = (field: keyof SignUpForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    async function signUser() {
        setError("");

        if (!form.name || !form.Phone || !form.Email || !form.Password || !form.Role) {
            setError("Iltimos, barcha maydonlarni to'ldiring.");
            return;
        }

        if (form.Password.length < 8) {
            setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
            return;
        }

        setIsLoading(true);
        try {
            const createdUser = await registerWithEmail({
                name: form.name,
                Phone: form.Phone,
                Email: form.Email,
                Password: form.Password,
                Role: form.Role,
            });
            navigateByRole(createdUser.Role);
        } catch (authError) {
            try {
                const existingUser = await loginWithEmail(form.Email, form.Password);
                saveSession(existingUser);
                navigateByRole(existingUser.Role);
            } catch {
                setError(getAuthErrorMessage(authError));
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSocialLogin(provider: SocialProviderName) {
        setError("");
        setLoadingProvider(provider);
        try {
            const user = await loginWithSocialProvider(provider, form.Role || "user");
            navigateByRole(user.Role);
        } catch (authError) {
            setError(getAuthErrorMessage(authError));
        } finally {
            setLoadingProvider(null);
        }
    }

    return (
        <div className="auth-container d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="auth-card shadow-lg bg-white rounded-4 p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold">Mentor uz hisobini yarating</h4>
                    <p className="text-muted small">Platformadan to'liq foydalanish uchun ro'yxatdan o'ting</p>
                </div>

                <div className="d-grid gap-2 mb-4">
                    {socialProviders.map((provider) => (
                        <button
                            key={provider.id}
                            type="button"
                            onClick={() => handleSocialLogin(provider.id)}
                            disabled={Boolean(loadingProvider) || isLoading}
                            className="btn btn-outline-dark social-auth-btn"
                        >
                            {loadingProvider === provider.id ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : (
                                <i className={`bi ${provider.icon} me-2`}></i>
                            )}
                            {provider.label} orqali davom etish
                        </button>
                    ))}
                </div>

                <div className="auth-divider mb-4"><span>Email orqali</span></div>

                <div className="form-content">
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Ismingiz</label>
                        <input
                            value={form.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            placeholder="Ismingizni kiriting"
                            type="text"
                            className="form-control custom-input"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Telefon raqam</label>
                        <input
                            value={form.Phone}
                            onChange={(event) => updateField("Phone", event.target.value)}
                            placeholder="+998 90 123 45 67"
                            type="text"
                            className="form-control custom-input"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Email manzilingiz</label>
                        <input
                            value={form.Email}
                            onChange={(event) => updateField("Email", event.target.value)}
                            placeholder="example@gmail.com"
                            type="email"
                            className="form-control custom-input"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Parol</label>
                        <input
                            value={form.Password}
                            onChange={(event) => updateField("Password", event.target.value)}
                            placeholder="********"
                            type="password"
                            className="form-control custom-input"
                        />
                        {form.Password && form.Password.length < 8 && (
                            <div className="text-danger x-small mt-1">
                                <i className="bi bi-exclamation-circle me-1"></i>
                                Parol kamida 8 ta belgidan iborat bo'lishi kerak
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-semibold">Rolingizni tanlang</label>
                        <select
                            value={form.Role}
                            onChange={(event) => updateField("Role", event.target.value)}
                            className="form-select custom-input"
                        >
                            <option disabled value="">Tanlang...</option>
                            <option value="user">O'quvchi</option>
                            <option value="teacher">O'qituvchi</option>
                        </select>
                    </div>
                    {error && (
                        <div className="alert alert-danger border-0 rounded-3 small py-2 mb-3">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={signUser}
                        className="btn btn-dark w-100 py-2 fw-bold rounded-3 mb-3 auth-btn"
                        disabled={isLoading || Boolean(loadingProvider)}
                    >
                        {isLoading ? "Tekshirilmoqda..." : "Ro'yxatdan o'tish"}
                    </button>
                    <p className="small text-muted text-center mb-0">
                        Hisobingiz bormi? <Link to="/signIn" className="fw-bold text-decoration-none">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
