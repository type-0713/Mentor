import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getAuthErrorMessage,
    loginWithEmail,
    loginWithSocialProvider,
    type SocialProviderName,
} from "../utils/auth";
import "../index.css";

const socialProviders: Array<{ id: SocialProviderName; label: string; icon: string }> = [
    { id: "google", label: "Google", icon: "bi-google" },
    { id: "microsoft", label: "Microsoft", icon: "bi-microsoft" },
    { id: "apple", label: "Apple", icon: "bi-apple" },
];

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

    async function signInWithEmail() {
        setError("");

        if (!email || !password) {
            setError("Email va parolni kiriting.");
            return;
        }

        setIsLoading(true);
        try {
            const user = await loginWithEmail(email, password);
            navigateByRole(user.Role);
        } catch (authError) {
            setError(getAuthErrorMessage(authError));
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSocialLogin(provider: SocialProviderName) {
        setError("");
        setLoadingProvider(provider);
        try {
            const user = await loginWithSocialProvider(provider);
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
                    <h4 className="fw-bold">Mentor uz ga kirish</h4>
                    <p className="text-muted small">Hisobingizga email yoki ijtimoiy login orqali kiring</p>
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
                            {provider.label} orqali kirish
                        </button>
                    ))}
                </div>

                <div className="auth-divider mb-4"><span>Email orqali</span></div>

                <div className="mb-3">
                    <label className="form-label small fw-semibold">Email manzil</label>
                    <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="example@gmail.com"
                        type="email"
                        className="form-control custom-input"
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label small fw-semibold">Parol</label>
                    <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="********"
                        type="password"
                        className="form-control custom-input"
                    />
                </div>

                {error && (
                    <div className="alert alert-danger border-0 rounded-3 small py-2 mb-3">
                        {error}
                    </div>
                )}

                <button
                    onClick={signInWithEmail}
                    className="btn btn-dark w-100 py-2 fw-bold rounded-3 mb-3 auth-btn"
                    disabled={isLoading || Boolean(loadingProvider)}
                >
                    {isLoading ? "Kirilmoqda..." : "Sign In"}
                </button>

                <p className="small text-muted text-center mb-0">
                    Hisobingiz yo'qmi? <Link to="/signUp" className="fw-bold text-decoration-none">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
