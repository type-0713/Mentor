import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requireRole } from "../utils/auth";
import {
  buyPremiumWithCoins,
  demoCourse,
  downloadCertificatePdf,
  getCourseDescription,
  getCourseImage,
  getCourseMinutes,
  getCourseProgress,
  getCourseTitle,
  getCourseVideoCount,
  getWallet,
  hasPremium,
  issueCertificate,
  markVideoWatched,
  normalizeCourseModules,
  normalizeCourseTest,
  scoreCourseTest,
  shuffleQuestionOptions,
  type TestResult,
} from "../utils/platform";
import type { CertificateRecord, CourseRecord, VideoLesson } from "../utils/types";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

const getSelectedCourse = (): CourseRecord | null => {
  try {
    return JSON.parse(sessionStorage.getItem("selectedCourse") || "null");
  } catch {
    return null;
  }
};

const AboutC = () => {
  const navigate = useNavigate();
  const [course] = useState<CourseRecord>(() => getSelectedCourse() || demoCourse);
  const [wallet, setWallet] = useState(() => getWallet());
  const [progress, setProgress] = useState(() => getCourseProgress(course));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [notice, setNotice] = useState("");

  const modules = useMemo(() => normalizeCourseModules(course), [course]);
  const test = useMemo(() => normalizeCourseTest(course), [course]);
  const questions = useMemo(() => (test ? test.questions.map(shuffleQuestionOptions) : []), [test]);
  const premiumActive = hasPremium(wallet);
  const isLocked = Boolean(course.premium && !premiumActive);
  const courseTitle = getCourseTitle(course);

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  const refreshLocalState = () => {
    setWallet(getWallet());
    setProgress(getCourseProgress(course));
  };

  const openVideo = (video: VideoLesson) => {
    if (isLocked) {
      setNotice("Bu kurs premium foydalanuvchilar uchun. Avval premiumni faollashtiring.");
      return;
    }

    const result = markVideoWatched(course, video);
    setWallet(result.wallet);
    setProgress(getCourseProgress(course));
    setNotice(result.awarded ? "+1 T-Coin qo'shildi. Video progress yangilandi." : "Bu video oldin hisoblangan.");
    window.open(video.youtubeUrl, "_blank", "noopener,noreferrer");
  };

  const submitTest = () => {
    if (!test) {
      setNotice("Bu kursda test hali biriktirilmagan.");
      return;
    }

    if (Object.keys(answers).length < test.questions.length) {
      setNotice("Testni yakunlash uchun barcha savollarga javob bering.");
      return;
    }

    const result = scoreCourseTest(test, answers);
    setTestResult(result);

    if (!result.passed) {
      setNotice("Natija 70% dan past. Yana tayyorlanib qayta urinib ko'ring.");
      return;
    }

    if (progress.percent < 100) {
      setNotice("Testdan o'tdingiz. Sertifikat uchun barcha videolarni yakunlang.");
      return;
    }

    const createdCertificate = issueCertificate(course, result);
    setCertificate(createdCertificate);
    refreshLocalState();
    setNotice("Tabriklaymiz! Sertifikat yaratildi va profilga saqlandi.");
  };

  const activatePremium = () => {
    const result = buyPremiumWithCoins();
    setWallet(result.wallet);
    setNotice(result.ok ? "Premium 7 kunga faollashdi." : "Premium uchun 250 T-Coin kerak.");
  };

  function clearSelection() {
    sessionStorage.removeItem("selectedCourse");
  }

  return (
    <div className="mentor-shell min-vh-100">
      <header className="mentor-topbar sticky-top">
        <div className="container-fluid px-3 px-lg-4 d-flex justify-content-between align-items-center">
          <Link onClick={clearSelection} to="/User" className="brand-mark">
            <img width={50} src={logo} alt="Mentor.uz" />
          </Link>
          <div className="d-flex gap-2 flex-wrap justify-content-end">
            <span className="wallet-pill">
              <i className="bi bi-coin"></i> {wallet.tCoins} T-Coin
            </span>
            <Link onClick={clearSelection} to="/User" className="btn btn-outline-dark btn-sm rounded-pill px-4 fw-bold">
              <i className="bi bi-arrow-left me-2"></i> Kurslarga qaytish
            </Link>
          </div>
        </div>
      </header>

      <main className="container-fluid px-3 px-lg-4 py-4">
        <section className="course-detail-hero mb-4">
          <div className="course-detail-media">
            <img src={getCourseImage(course)} alt={courseTitle} />
            <button
              type="button"
              onClick={() => modules[0]?.videos[0] && openVideo(modules[0].videos[0])}
              className="play-fab"
              aria-label="Birinchi videoni ko'rish"
            >
              <i className="bi bi-play-fill"></i>
            </button>
            {course.premium && <span className="premium-ribbon">Premium</span>}
          </div>

          <div className="course-detail-copy">
            <span className="section-kicker">{course.category || "IT kurs"} / {course.level || "Amaliy"}</span>
            <h1>{courseTitle}</h1>
            <p>{getCourseDescription(course)}</p>
            <div className="course-metrics">
              <div>
                <strong>{getCourseVideoCount(course)}</strong>
                <span>Video</span>
              </div>
              <div>
                <strong>{modules.length}</strong>
                <span>Modul</span>
              </div>
              <div>
                <strong>{getCourseMinutes(course)}</strong>
                <span>Daqiqa</span>
              </div>
              <div>
                <strong>{progress.percent}%</strong>
                <span>Progress</span>
              </div>
            </div>
            <div className="progress mentor-progress mt-3" role="progressbar" aria-label="Kurs progressi">
              <div className="progress-bar" style={{ width: `${progress.percent}%` }}></div>
            </div>

            {isLocked && (
              <div className="premium-lock mt-4">
                <i className="bi bi-stars"></i>
                <div>
                  <strong>Premium kurs</strong>
                  <span>250 T-Coin evaziga 7 kunlik premium oling va kursni oching.</span>
                </div>
                <button onClick={activatePremium} className="btn btn-mentor-primary rounded-pill px-4">
                  Premium olish
                </button>
              </div>
            )}
          </div>
        </section>

        {notice && (
          <div className="alert mentor-alert border-0 rounded-4 d-flex align-items-center gap-2">
            <i className="bi bi-info-circle"></i>
            <span>{notice}</span>
          </div>
        )}

        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <section className="premium-panel h-100">
              <div className="panel-header">
                <span className="section-kicker">Kurs modullari</span>
                <h2>Video darslar</h2>
              </div>

              <div className="module-list">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="module-row">
                    <div className="module-row-head">
                      <span>{moduleIndex + 1}</span>
                      <div>
                        <strong>{module.title}</strong>
                        <small>{module.videos.length} ta video</small>
                      </div>
                    </div>
                    <div className="video-list">
                      {module.videos.map((video) => {
                        const watched = progress.watchedVideoIds.includes(video.id);

                        return (
                          <button
                            key={video.id}
                            type="button"
                            onClick={() => openVideo(video)}
                            className={`video-lesson-button ${watched ? "is-done" : ""}`}
                          >
                            <span className="video-status">
                              <i className={`bi ${watched ? "bi-check2" : "bi-play-fill"}`}></i>
                            </span>
                            <span className="video-text">
                              <strong>{video.title}</strong>
                              <small>{video.minutes} daqiqa / +1 T-Coin</small>
                            </span>
                            <i className="bi bi-box-arrow-up-right"></i>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="col-12 col-xl-5">
            <section className="premium-panel mb-4">
              <div className="panel-header">
                <span className="section-kicker">Majburiy test</span>
                <h2>{test ? `${test.questions.length} savol / ${test.timeLimitMinutes} daqiqa` : "Test biriktirilmagan"}</h2>
              </div>

              {test ? (
                <div className="test-runner">
                  {questions.map((question, questionIndex) => {
                    const detail = testResult?.details.find((item) => item.questionId === question.id);

                    return (
                      <div key={question.id} className={`test-question ${detail ? (detail.correct ? "is-correct" : "is-wrong") : ""}`}>
                        <div className="d-flex justify-content-between gap-3">
                          <strong>{questionIndex + 1}. {question.question}</strong>
                          {detail && (
                            <span className="result-dot">
                              <i className={`bi ${detail.correct ? "bi-check2" : "bi-x-lg"}`}></i>
                            </span>
                          )}
                        </div>
                        <div className="test-options">
                          {question.options.map((option) => (
                            <label key={option.id} className="test-option">
                              <input
                                type="radio"
                                name={question.id}
                                checked={answers[question.id] === option.id}
                                onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                                disabled={Boolean(testResult)}
                              />
                              <span>{option.text}</span>
                            </label>
                          ))}
                        </div>
                        {detail && question.explanation && <p className="test-explanation">{question.explanation}</p>}
                      </div>
                    );
                  })}

                  {testResult ? (
                    <div className={`test-summary ${testResult.passed ? "passed" : "failed"}`}>
                      <strong>{testResult.percent}%</strong>
                      <span>
                        {testResult.correct}/{testResult.total} to'g'ri. {testResult.passed ? "O'tdingiz." : "Yiqildingiz."}
                      </span>
                    </div>
                  ) : (
                    <button onClick={submitTest} className="btn btn-mentor-primary w-100 rounded-4 py-3 fw-bold">
                      Testni yakunlash
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-muted mb-0">O'qituvchi test qo'shgandan keyin shu yerda ko'rinadi.</p>
              )}
            </section>

            <section className={`certificate-preview ${certificate ? "is-ready" : ""}`}>
              <div>
                <span className="section-kicker">Certificate</span>
                <h2>{certificate ? certificate.certificateId : "Sertifikat tayyor emas"}</h2>
                <p>
                  Barcha videolar yakunlanib, testdan kamida 70% olinsa sertifikat avtomatik profilga qo'shiladi.
                </p>
              </div>
              {certificate && (
                <button onClick={() => downloadCertificatePdf(certificate)} className="btn btn-light rounded-pill px-4 fw-bold">
                  <i className="bi bi-filetype-pdf me-2"></i> PDF yuklab olish
                </button>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutC;
