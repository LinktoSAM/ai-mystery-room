import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateMystery from './pages/CreateMystery';
import InvestigationRoom from './pages/InvestigationRoom';
import Accusation from './pages/Accusation';
import Results from './pages/Results';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#0b0d13] text-gray-100 font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateMystery />} />
            <Route path="/case/:id" element={<InvestigationRoom />} />
            <Route path="/case/:id/accuse" element={<Accusation />} />
            <Route path="/case/:id/result" element={<Results />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

