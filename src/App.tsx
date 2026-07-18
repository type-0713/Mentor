import { Route, Routes } from "react-router-dom";
import SignIn from "./page/signIn";
import SignUp from "./page/signUp";
import Home from "./page/Home";
import User from "./page/User";
import Teacher from "./page/Teacher";
import Courses from "./page/Courses";
import Code from "./page/Code";
import ProfileU from "./page/ProfileU";
import BecomeTeacher from "./page/BecomeTeacher";
import TCode from "./page/TCode";
import TCourses from "./page/TCourses";
import About from "./page/About";
import About1 from "./page/Aboute1";
import AboutC from "./page/AboutC";
import AbouteS from "./page/AbouteS";
import A from "./page/404";
import AITeacher from "./page/AITeacher";
import Admin from "./page/Admin";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="*" element={<A />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/" element={<Home />} />
        <Route path="/User" element={<User />}>
          <Route index element={<Courses />} />
          <Route path="Sourcecode" element={<Code />} />
        </Route>
        <Route path="/Teacher" element={<Teacher />} />
        <Route path="/ProfileT" element={<About />} />
        <Route path="/Course" element={<TCourses />} />
        <Route path="/Code" element={<TCode />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/User/Aboute" element={<AboutC />} />
        <Route path="/User/Sourcecodes" element={<AbouteS />} />
        <Route path="/ProfileU" element={<ProfileU />}>
          <Route path="BecomeTeacher" element={<BecomeTeacher />} />
          <Route path="AI" element={<AITeacher />} />
          <Route index element={<About1 />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
