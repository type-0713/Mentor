import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCoursesQuery } from "../utils/api";
import { requireRole } from "../utils/auth";
import {
  demoCourse,
  getCourseDescription,
  getCourseImage,
  getCourseMinutes,
  getCourseProgress,
  getCourseTitle,
  getCourseVideoCount,
  getWallet,
  hasPremium,
  normalizeCourseModules,
  normalizeCourseTest,
} from "../utils/platform";
import type { CourseRecord } from "../utils/types";
import "../index.css";

const Courses = () => {
  const navigate = useNavigate();
  const { data = [], isError, isLoading } = useCoursesQuery("");
  const wallet = getWallet();
  const courses = useMemo(() => {
    const firebaseCourses = data as CourseRecord[];
    return firebaseCourses.length ? firebaseCourses : [demoCourse];
  }, [data]);

  useEffect(() => {
    if (!requireRole("user")) {
      navigate("/signUp");
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (isError) {
    return <h2 className="text-center mt-5 text-danger">Kurslarni yuklashda xatolik...</h2>;
  }

  function handleClick(item: CourseRecord) {
    sessionStorage.setItem("selectedCourse", JSON.stringify(item));
    navigate("/User/Aboute");
  }

  return (
    <div className="courses-screen">
      <section className="catalog-hero mb-4">
        <div>
          <span className="section-kicker">Mentor.uz Academy</span>
          <h1>Kurslar katalogi</h1>
          <p>
            Modulli video darslar, yakuniy testlar, T-Coin mukofotlari va avtomatik sertifikatlar bitta oqimda.
          </p>
        </div>
        <div className="catalog-summary">
          <div>
            <strong>{courses.length}</strong>
            <span>Kurs</span>
          </div>
          <div>
            <strong>{courses.reduce((sum, course) => sum + getCourseVideoCount(course), 0)}</strong>
            <span>Video</span>
          </div>
          <div>
            <strong>{wallet.tCoins}</strong>
            <span>T-Coin</span>
          </div>
        </div>
      </section>

      <div className="course-grid-premium">
        {courses.map((item) => {
          const progress = getCourseProgress(item);
          const modules = normalizeCourseModules(item);
          const test = normalizeCourseTest(item);
          const locked = Boolean(item.premium && !hasPremium(wallet));

          return (
            <button key={item.id} type="button" className="course-card-premium" onClick={() => handleClick(item)}>
              <div className="course-cover">
                <img src={getCourseImage(item)} alt={getCourseTitle(item)} />
                <span className={`course-chip ${locked ? "locked" : ""}`}>
                  <i className={`bi ${locked ? "bi-lock" : item.premium ? "bi-stars" : "bi-unlock"}`}></i>
                  {locked ? "Premium" : item.premium ? "Premium ochiq" : "Bepul"}
                </span>
              </div>
              <div className="course-card-body">
                <div className="d-flex justify-content-between gap-3 align-items-start">
                  <div>
                    <span className="section-kicker">{item.category || "IT"} / {item.level || "Amaliy"}</span>
                    <h2>{getCourseTitle(item)}</h2>
                  </div>
                  <span className="course-arrow">
                    <i className="bi bi-arrow-up-right"></i>
                  </span>
                </div>
                <p>{getCourseDescription(item)}</p>
                <div className="course-card-meta">
                  <span><i className="bi bi-layers"></i> {modules.length} modul</span>
                  <span><i className="bi bi-play-btn"></i> {getCourseVideoCount(item)} video</span>
                  <span><i className="bi bi-clock"></i> {getCourseMinutes(item)} daq</span>
                  <span><i className="bi bi-patch-question"></i> {test?.questions.length || 0} test</span>
                </div>
                <div className="progress mentor-progress mt-3" aria-label={`${getCourseTitle(item)} progress`}>
                  <div className="progress-bar" style={{ width: `${progress.percent}%` }}></div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2 small">
                  <span className="text-muted">{progress.completedVideos}/{progress.totalVideos} video yakunlandi</span>
                  <strong>{progress.percent}%</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Courses;
