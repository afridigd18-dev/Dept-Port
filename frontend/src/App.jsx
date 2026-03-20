import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import FacultyMarkEntry from './pages/FacultyMarkEntry';
import ClassAnalytics from './pages/ClassAnalytics';
import BulkUpload from './pages/BulkUpload';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import './index.css';
import { LayoutDashboard, UserPlus, BarChart3, LogIn, LogOut, GraduationCap, FileUp } from 'lucide-react';

const App = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
        {/* Sidebar */}
        <nav style={{ width: '250px', background: '#1a1a1a', padding: '2rem', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: '#6366f1', marginBottom: '3rem' }}>DeptPro</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {!isLoggedIn && (
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ccc', textDecoration: 'none' }}>
                <LogIn size={20} /> Login
              </Link>
            )}

            {isLoggedIn && role === 'FACULTY' && (
              <>
                <Link to="/faculty-entry" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ccc', textDecoration: 'none' }}>
                  <UserPlus size={20} /> Faculty Entry
                </Link>
                <Link to="/bulk-upload" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ccc', textDecoration: 'none' }}>
                  <FileUp size={20} /> Bulk CSV Upload
                </Link>
                <Link to="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ccc', textDecoration: 'none' }}>
                  <BarChart3 size={20} /> Class Analytics
                </Link>
              </>
            )}

            {isLoggedIn && role === 'STUDENT' && (
              <Link to="/student-dashboard" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ccc', textDecoration: 'none' }}>
                <GraduationCap size={20} /> My Dashboard
              </Link>
            )}
          </div>

          {isLoggedIn && (
            <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <LogOut size={20} /> Logout
            </button>
          )}
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', background: '#111' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/faculty-entry" element={
              isLoggedIn && role === 'FACULTY' ? <FacultyMarkEntry /> : <Navigate to="/login" />
            } />
            
            <Route path="/bulk-upload" element={
              isLoggedIn && role === 'FACULTY' ? <BulkUpload /> : <Navigate to="/login" />
            } />
            
            <Route path="/analytics" element={
              isLoggedIn && role === 'FACULTY' ? <ClassAnalytics /> : <Navigate to="/login" />
            } />
            
            <Route path="/student-dashboard" element={
              isLoggedIn && role === 'STUDENT' ? <StudentDashboard /> : <Navigate to="/login" />
            } />
            
            <Route path="/" element={
              <div className="card">
                <h1>Welcome to DeptPro Academic Module</h1>
                <p>Please login to access your dashboard.</p>
                {!isLoggedIn && <Link to="/login" className="badge badge-pass" style={{ textDecoration: 'none', fontSize: '1rem', padding: '10px 20px', display: 'inline-block', marginTop: '1rem' }}>Login Now</Link>}
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
