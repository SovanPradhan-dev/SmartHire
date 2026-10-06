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
import Voice from "./component/Voice.jsx"
import Testing from "./component/testing.jsx"
import Profile from "./component/Profile.jsx";
import AuthCallback from "./component/AuthCallback.jsx";
function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<><Division/><Floting></Floting><LandingPage /><Footer /></>} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />}  />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/interview" element={<ProtectedRoute><Division /><Floting /><UploadPage/><Footer /></ProtectedRoute>} />
        <Route path="/compiler" element={<ProtectedRoute><Division /><Floting /><Compiler /><Footer /></ProtectedRoute>} />
        <Route path="/interviewer" element={<><Division /><Leaderboard /><Footer /></>} />
        <Route path="/quiz" element={<ProtectedRoute><Floting /><QuizApp /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="/voice" element={<ProtectedRoute><Voice /></ProtectedRoute>} />
        <Route path="/test" element={<Testing />} />
        <Route path="/profile" element={<Profile /> } />
      </Routes>
    </>
  );
}

export default App;
