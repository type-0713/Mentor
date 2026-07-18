import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCourseMutation } from "../utils/api";
import { getCurrentUserId, requireRole } from "../utils/auth";
import { PASSING_PERCENT, clampNumber, getSessionUser } from "../utils/platform";
import type { CourseModule, CourseTest, TestQuestion, VideoLesson } from "../utils/types";
import "../index.css";
import logo from "../assets/mentor-logo.svg";

type VideoDraft = {
  title: string;
  youtubeUrl: string;
  minutes: string;
};

type ModuleDraft = {
  title: string;
  videoCount: number;
  videos: VideoDraft[];
};

type QuestionDraft = {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

type CourseForm = {
  Lesson: string;
  Dec: string;
  Day: string;
  Img: string;
  category: string;
  level: string;
  moduleCount: number;
  testTime: number;
  questionCount: number;
  premium: boolean;
  modules: ModuleDraft[];
  questions: QuestionDraft[];
};

const createVideoDraft = (moduleIndex: number, videoIndex: number): VideoDraft => ({
  title: `${moduleIndex + 1}.${videoIndex + 1} video`,
  youtubeUrl: "",
  minutes: "15",
});

const createModuleDraft = (index: number): ModuleDraft => ({
  title: `${index + 1}-modul`,
  videoCount: 1,
  videos: [createVideoDraft(index, 0)],
});

const createQuestionDraft = (index: number): QuestionDraft => ({
  question: `${index + 1}-savol`,
  options: ["A variant", "B variant", "C variant", "D variant"],
  correctIndex: 0,
  explanation: "",
});

const syncModules = (count: number, modules: ModuleDraft[]) =>
  Array.from({ length: count }, (_, index) => modules[index] || createModuleDraft(index));

const syncVideos = (moduleIndex: number, count: number, videos: VideoDraft[]) =>
  Array.from({ length: count }, (_, index) => videos[index] || createVideoDraft(moduleIndex, index));

const syncQuestions = (count: number, questions: QuestionDraft[]) =>
  Array.from({ length: count }, (_, index) => questions[index] || createQuestionDraft(index));

const TCourses = () => {
  const [addCourse, { isLoading }] = useCourseMutation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState<CourseForm>({
    Lesson: "",
    Dec: "",
    Day: new Date().toISOString().slice(0, 10),
    Img: "",
    category: "Frontend",
    level: "Boshlang'ich",
    moduleCount: 1,
    testTime: 30,
    questionCount: 1,
    premium: false,
    modules: [createModuleDraft(0)],
    questions: [createQuestionDraft(0)],
  });

  useEffect(() => {
    if (!requireRole(["teacher", "admin"])) {
      navigate("/signUp");
    }
  }, [navigate]);

  const totals = useMemo(() => {
    const videos = form.modules.reduce((sum, module) => sum + module.videos.length, 0);
    const minutes = form.modules.reduce(
      (sum, module) => sum + module.videos.reduce((videoSum, video) => videoSum + (Number(video.minutes) || 0), 0),
      0,
    );

    return { videos, minutes };
  }, [form.modules]);

  const updateField = <T extends keyof CourseForm>(field: T, value: CourseForm[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateModuleCount = (value: string) => {
    const moduleCount = clampNumber(Number(value) || 1, 1, 100);
    setForm((current) => ({ ...current, moduleCount, modules: syncModules(moduleCount, current.modules) }));
  };

  const updateQuestionCount = (value: string) => {
    const questionCount = clampNumber(Number(value) || 1, 1, 100);
    setForm((current) => ({ ...current, questionCount, questions: syncQuestions(questionCount, current.questions) }));
  };

  const updateModule = (moduleIndex: number, updater: (module: ModuleDraft) => ModuleDraft) => {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, index) => (index === moduleIndex ? updater(module) : module)),
    }));
  };

  const updateVideo = (moduleIndex: number, videoIndex: number, field: keyof VideoDraft, value: string) => {
    updateModule(moduleIndex, (module) => ({
      ...module,
      videos: module.videos.map((video, index) => (index === videoIndex ? { ...video, [field]: value } : video)),
    }));
  };

  const updateQuestion = (questionIndex: number, updater: (question: QuestionDraft) => QuestionDraft) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => (index === questionIndex ? updater(question) : question)),
    }));
  };

  const buildModules = (): CourseModule[] =>
    form.modules.map((module, moduleIndex) => ({
      id: `module-${moduleIndex + 1}`,
      title: module.title.trim() || `${moduleIndex + 1}-modul`,
      videos: module.videos.map<VideoLesson>((video, videoIndex) => ({
        id: `module-${moduleIndex + 1}-video-${videoIndex + 1}`,
        title: video.title.trim() || `${moduleIndex + 1}.${videoIndex + 1} video`,
        youtubeUrl: video.youtubeUrl.trim(),
        minutes: clampNumber(Number(video.minutes) || 15, 1, 600),
        isPreview: moduleIndex === 0 && videoIndex === 0,
      })),
    }));

  const buildTest = (): CourseTest => ({
    timeLimitMinutes: clampNumber(form.testTime, 1, 180),
    passingPercent: PASSING_PERCENT,
    questions: form.questions.map<TestQuestion>((question, questionIndex) => ({
      id: `question-${questionIndex + 1}`,
      question: question.question.trim() || `${questionIndex + 1}-savol`,
      explanation: question.explanation.trim(),
      options: question.options.map((option, optionIndex) => ({
        id: `question-${questionIndex + 1}-option-${optionIndex + 1}`,
        text: option.trim() || `${optionIndex + 1}-variant`,
        isCorrect: optionIndex === question.correctIndex,
      })),
    })),
  });

  async function addCourses() {
    setError("");
    const teacherId = getCurrentUserId();
    const modules = buildModules();
    const missingVideoUrl = modules.some((module) => module.videos.some((video) => !video.youtubeUrl));
    const missingQuestion = form.questions.some((question) => !question.question.trim());

    if (!form.Lesson.trim() || !form.Dec.trim() || !form.Img.trim()) {
      setError("Kurs nomi, tavsif va rasm URL maydonlarini to'ldiring.");
      return;
    }

    if (missingVideoUrl) {
      setError("Har bir video uchun YouTube link kiritilishi kerak.");
      return;
    }

    if (missingQuestion) {
      setError("Testdagi barcha savol matnlarini kiriting.");
      return;
    }

    const session = getSessionUser();
    const payload = {
      Lesson: form.Lesson.trim(),
      Dec: form.Dec.trim(),
      Day: form.Day || new Date().toISOString().slice(0, 10),
      Img: form.Img.trim(),
      Video: modules[0]?.videos[0]?.youtubeUrl || "",
      Count: totals.videos,
      Id: teacherId,
      category: form.category,
      level: form.level,
      premium: form.premium,
      teacherName: session.name,
      Modules: modules,
      Test: buildTest(),
    };

    try {
      await addCourse(payload).unwrap();
      navigate("/Teacher");
    } catch {
      setError("Kursni saqlashda xatolik yuz berdi. Firebase ruxsatlarini tekshiring.");
    }
  }

  return (
    <div className="mentor-shell min-vh-100 pb-5">
      <header className="mentor-topbar sticky-top">
        <div className="container-fluid px-3 px-lg-4 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Link to="/Teacher" className="brand-mark">
              <img src={logo} alt="Mentor.uz" />
            </Link>
            <div>
              <span className="section-kicker">Teacher Studio</span>
              <h1 className="topbar-title">Kurs konstruktori</h1>
            </div>
          </div>
          <Link to="/Teacher" className="btn btn-outline-dark btn-sm rounded-pill px-4">
            <i className="bi bi-arrow-left me-1"></i> Orqaga
          </Link>
        </div>
      </header>

      <main className="container-fluid px-3 px-lg-4 py-4">
        <div className="studio-hero mb-4">
          <div>
            <span className="section-kicker text-warning">1-100 modul, 1-50 video</span>
            <h2>Premium kursni strukturali yarating</h2>
            <p>
              Video inputlari moduldagi video soniga qarab avtomatik paydo bo'ladi. Yakuniy test 70% o'tish
              chegarasi bilan saqlanadi.
            </p>
          </div>
          <div className="studio-stats">
            <div>
              <strong>{form.moduleCount}</strong>
              <span>Modul</span>
            </div>
            <div>
              <strong>{totals.videos}</strong>
              <span>Video</span>
            </div>
            <div>
              <strong>{form.questionCount}</strong>
              <span>Savol</span>
            </div>
            <div>
              <strong>{totals.minutes}</strong>
              <span>Daqiqa</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <section className="premium-panel">
              <div className="panel-header">
                <span className="section-kicker">Asosiy ma'lumot</span>
                <h2>Kurs pasporti</h2>
              </div>

              <label className="form-label fw-semibold small">Kurs nomi</label>
              <input
                value={form.Lesson}
                onChange={(event) => updateField("Lesson", event.target.value)}
                className="form-control mentor-input mb-3"
                placeholder="Masalan: Next.js va Firebase"
              />

              <label className="form-label fw-semibold small">Tavsif</label>
              <textarea
                value={form.Dec}
                onChange={(event) => updateField("Dec", event.target.value)}
                className="form-control mentor-input mb-3"
                rows={4}
                placeholder="Kurs natijasi, kimlar uchunligi va amaliy loyiha haqida yozing"
              />

              <label className="form-label fw-semibold small">Rasm URL</label>
              <input
                value={form.Img}
                onChange={(event) => updateField("Img", event.target.value)}
                className="form-control mentor-input mb-3"
                placeholder="https://..."
              />

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold small">Kategoriya</label>
                  <select
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="form-select mentor-input"
                  >
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>Mobile</option>
                    <option>Design</option>
                    <option>AI</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold small">Daraja</label>
                  <select
                    value={form.level}
                    onChange={(event) => updateField("level", event.target.value)}
                    className="form-select mentor-input"
                  >
                    <option>Boshlang'ich</option>
                    <option>O'rta</option>
                    <option>Professional</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mt-1">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold small">Modullar soni</label>
                  <input
                    value={form.moduleCount}
                    onChange={(event) => updateModuleCount(event.target.value)}
                    min={1}
                    max={100}
                    type="number"
                    className="form-control mentor-input"
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold small">Sana</label>
                  <input
                    value={form.Day}
                    onChange={(event) => updateField("Day", event.target.value)}
                    type="date"
                    className="form-control mentor-input"
                  />
                </div>
              </div>

              <div className="premium-switch mt-4">
                <div>
                  <strong>Maxsus premium kurs</strong>
                  <span>Faqat premium foydalanuvchilar ko'radi</span>
                </div>
                <input
                  aria-label="Premium kurs"
                  type="checkbox"
                  checked={form.premium}
                  onChange={(event) => updateField("premium", event.target.checked)}
                />
              </div>

              {error && <div className="alert alert-danger border-0 rounded-4 small mt-4 mb-0">{error}</div>}
            </section>
          </div>

          <div className="col-12 col-xl-8">
            <section className="premium-panel mb-4">
              <div className="panel-header d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <span className="section-kicker">Video modullar</span>
                  <h2>Avtomatik YouTube inputlari</h2>
                </div>
                <span className="soft-badge">{totals.videos} ta video</span>
              </div>

              <div className="module-stack">
                {form.modules.map((module, moduleIndex) => (
                  <div className="module-editor" key={`module-${moduleIndex + 1}`}>
                    <div className="module-editor-head">
                      <div>
                        <span className="section-kicker">{moduleIndex + 1}-modul</span>
                        <input
                          value={module.title}
                          onChange={(event) => updateModule(moduleIndex, (current) => ({ ...current, title: event.target.value }))}
                          className="form-control mentor-input module-title-input"
                          placeholder="Modul nomi"
                        />
                      </div>
                      <div className="video-count-control">
                        <label className="form-label small fw-semibold mb-1">Video soni</label>
                        <input
                          value={module.videoCount}
                          onChange={(event) => {
                            const videoCount = clampNumber(Number(event.target.value) || 1, 1, 50);
                            updateModule(moduleIndex, (current) => ({
                              ...current,
                              videoCount,
                              videos: syncVideos(moduleIndex, videoCount, current.videos),
                            }));
                          }}
                          type="number"
                          min={1}
                          max={50}
                          className="form-control mentor-input"
                        />
                      </div>
                    </div>

                    <div className="row g-3">
                      {module.videos.map((video, videoIndex) => (
                        <div className="col-12 col-lg-6" key={`module-${moduleIndex + 1}-video-${videoIndex + 1}`}>
                          <div className="video-input-tile">
                            <div className="d-flex justify-content-between gap-2 mb-2">
                              <strong>{videoIndex + 1}-video</strong>
                              {moduleIndex === 0 && videoIndex === 0 && <span className="soft-badge">Preview</span>}
                            </div>
                            <input
                              value={video.title}
                              onChange={(event) => updateVideo(moduleIndex, videoIndex, "title", event.target.value)}
                              className="form-control mentor-input mb-2"
                              placeholder="Video sarlavhasi"
                            />
                            <input
                              value={video.youtubeUrl}
                              onChange={(event) => updateVideo(moduleIndex, videoIndex, "youtubeUrl", event.target.value)}
                              className="form-control mentor-input mb-2"
                              placeholder="YouTube link"
                            />
                            <input
                              value={video.minutes}
                              onChange={(event) => updateVideo(moduleIndex, videoIndex, "minutes", event.target.value)}
                              className="form-control mentor-input"
                              type="number"
                              min={1}
                              placeholder="Daqiqa"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="premium-panel">
              <div className="panel-header d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <span className="section-kicker">Majburiy yakuniy test</span>
                  <h2>70% va undan yuqori natija o'tadi</h2>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <label className="compact-field">
                    <span>Vaqt</span>
                    <input
                      value={form.testTime}
                      onChange={(event) => updateField("testTime", clampNumber(Number(event.target.value) || 1, 1, 180))}
                      type="number"
                      min={1}
                      max={180}
                    />
                  </label>
                  <label className="compact-field">
                    <span>Savol</span>
                    <input
                      value={form.questionCount}
                      onChange={(event) => updateQuestionCount(event.target.value)}
                      type="number"
                      min={1}
                      max={100}
                    />
                  </label>
                </div>
              </div>

              <div className="question-grid">
                {form.questions.map((question, questionIndex) => (
                  <div className="question-editor" key={`question-${questionIndex + 1}`}>
                    <span className="section-kicker">{questionIndex + 1}-savol</span>
                    <input
                      value={question.question}
                      onChange={(event) =>
                        updateQuestion(questionIndex, (current) => ({ ...current, question: event.target.value }))
                      }
                      className="form-control mentor-input mb-3"
                      placeholder="Savol matni"
                    />
                    <div className="answer-options">
                      {question.options.map((option, optionIndex) => (
                        <label className="answer-option-editor" key={`question-${questionIndex + 1}-option-${optionIndex + 1}`}>
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={question.correctIndex === optionIndex}
                            onChange={() =>
                              updateQuestion(questionIndex, (current) => ({ ...current, correctIndex: optionIndex }))
                            }
                          />
                          <input
                            value={option}
                            onChange={(event) =>
                              updateQuestion(questionIndex, (current) => {
                                const options = [...current.options] as QuestionDraft["options"];
                                options[optionIndex] = event.target.value;
                                return { ...current, options };
                              })
                            }
                            className="form-control mentor-input"
                            placeholder={`${optionIndex + 1}-variant`}
                          />
                        </label>
                      ))}
                    </div>
                    <input
                      value={question.explanation}
                      onChange={(event) =>
                        updateQuestion(questionIndex, (current) => ({ ...current, explanation: event.target.value }))
                      }
                      className="form-control mentor-input mt-3"
                      placeholder="Izoh (ixtiyoriy)"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addCourses}
                className="btn btn-mentor-primary w-100 py-3 fw-bold rounded-4 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-cloud-check me-2"></i>
                )}
                Kursni saqlash
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TCourses;
