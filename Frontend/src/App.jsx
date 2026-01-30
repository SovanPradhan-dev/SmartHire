import React from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./component/Nav";
import Division from "./component/Division";
import Footer from "./component/Footer.jsx";
import QuizApp from "./component/QuizApp";
import Signin from "./component/Signin.jsx";
import Signup from "./component/Signup.jsx";
import ProtectedRoute from "./component/Protectedroute.jsx";
import Leaderboard from "./component/Dashboard.jsx";
import UploadPage from "./component/Uploader.jsx";
import ResultPage from "./component/Matchrerasult.jsx";
import LandingPage from "./component/Homepage.jsx";
import About from "./pages/about";
import Contact from "./pages/contact";
import Features from "./pages/feature";
import Compiler from "./component/compiler.jsx";
import Floting from "./component/floting.jsx";

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<><Division/><Floting></Floting><LandingPage /><Footer /></>} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />}  />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/interview" element={<><Division /><ProtectedRoute><Floting /><UploadPage/></ProtectedRoute><Footer /></>} />
        <Route path="/compiler" element={<><Division /><ProtectedRoute><Floting /><Compiler /></ProtectedRoute><Footer /></>} />
        <Route path="/interviewer" element={<><Division /><Leaderboard /><Footer /></>} />
        <Route path="/quiz" element={<ProtectedRoute><Floting /><QuizApp /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
