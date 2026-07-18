import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requireRole } from "../utils/auth";
import {
  PREMIUM_PRICE_COINS,
  buyPremiumWithCoins,
  generateAiTeacherAnswer,
  getLanguage,
  getSessionUser,
  getWallet,
  hasPremium,
} from "../utils/platform";
import "../index.css";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const starterPrompts = [
  "React componentni qanday to'g'ri ajrataman?",
  "Firebase Firestore security rules nimadan boshlanadi?",
  "Test variantlarini random qilishda to'g'ri javob qanday saqlanadi?",
];

const AITeacher = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(() => getWallet());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Salom! Men Mentor.uz AI Ustoziman. Kod, test, Firebase yoki kurs bo'yicha savol bering.",
    },
  ]);
  const premiumActive = hasPremium(wallet);
  const session = getSessionUser();

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  const sendMessage = (text = input) => {
    const question = text.trim();

    if (!question) {
      return;
    }

    if (!premiumActive) {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-blocked`, role: "assistant", text: "AI Ustoz premium imkoniyat. 250 T-Coin bilan 7 kunga ochishingiz mumkin." },
      ]);
      return;
    }

    const answer = generateAiTeacherAnswer(question, getLanguage());
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", text: question },
      { id: `${Date.now()}-assistant`, role: "assistant", text: answer },
    ]);
    setInput("");
  };

  const activatePremium = () => {
    const result = buyPremiumWithCoins();
    setWallet(result.wallet);
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-premium`,
        role: "assistant",
        text: result.ok ? "Premium faollashdi. Endi savolingizni yuboring." : `${PREMIUM_PRICE_COINS} T-Coin kerak.`,
      },
    ]);
  };

  return (
    <div className="ai-teacher-page">
      <section className="ai-hero mb-4">
        <div>
          <span className="section-kicker">Premium chat</span>
          <h1>AI Ustoz</h1>
          <p>{session.name}, savolingizni yozing. Javoblar qisqa, amaliy va o'quvchi tilida beriladi.</p>
        </div>
        <div className="ai-status">
          <span className={premiumActive ? "online" : "locked"}>{premiumActive ? "Premium faol" : "Premium kerak"}</span>
          <strong>{wallet.tCoins} T-Coin</strong>
        </div>
      </section>

      {!premiumActive && (
        <section className="premium-lock mb-4">
          <i className="bi bi-lock"></i>
          <div>
            <strong>AI Teacher premium imkoniyat</strong>
            <span>250 T-Coin evaziga 7 kunlik premium, badge va maxsus sertifikat dizayni ochiladi.</span>
          </div>
          <button onClick={activatePremium} className="btn btn-mentor-primary rounded-pill px-4">
            Premium olish
          </button>
        </section>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <section className="chat-surface">
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`chat-bubble ${message.role}`}>
                  <span>{message.role === "assistant" ? "AI Ustoz" : "Siz"}</span>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
            <div className="chat-composer">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="form-control mentor-input"
                placeholder="Savolingizni yozing..."
              />
              <button onClick={() => sendMessage()} className="btn btn-mentor-primary" aria-label="Yuborish">
                <i className="bi bi-send"></i>
              </button>
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-4">
          <section className="premium-panel">
            <div className="panel-header">
              <span className="section-kicker">Tezkor savollar</span>
              <h2>Promptlar</h2>
            </div>
            <div className="prompt-list">
              {starterPrompts.map((prompt) => (
                <button key={prompt} onClick={() => sendMessage(prompt)} type="button">
                  <i className="bi bi-lightning-charge"></i>
                  {prompt}
                </button>
              ))}
            </div>
            <Link to="/ProfileU" className="btn btn-outline-dark rounded-pill w-100 mt-4">
              Dashboardga qaytish
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
