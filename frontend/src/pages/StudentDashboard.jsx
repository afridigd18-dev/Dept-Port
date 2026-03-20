import React, { useState, useEffect } from 'react';
import { marksAPI, authAPI } from '../services/api';

const StudentDashboard = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app, you would fetch the student ID from the logged-in user context
    // For this example, we'll assume we get it from localStorage or an API call
    const fetchMarks = async () => {
      try {
        // Fetch current user details first to get Student ID
        const userRes = await authAPI.getMe();
        const studentId = userRes.data.data.studentProfile._id; 
        
        const res = await marksAPI.getStudent(studentId);
        setMarks(res.data.data);
      } catch (err) {
        setError('Failed to load marks. Ensure you are logged in as a student.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  if (loading) return <div>Loading Performance Data...</div>;
  if (error) return <div className="badge badge-fail">{error}</div>;

  return (
    <div className="card">
      <h2>My Performance Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {marks.map((mark) => (
          <div key={mark._id} className="card" style={{ background: '#252525' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{mark.subject}</h3>
              <span className={`badge badge-${mark.result.toLowerCase()}`}>{mark.result}</span>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Internal (50)</span>
                <strong>{mark.internalTotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Semester (50)</span>
                <strong>{mark.semesterConverted}</strong>
              </div>
              <div style={{ borderTop: '1px solid #444', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Final Score</span>
                <strong style={{ fontSize: '1.2rem' }}>{mark.finalTotal}</strong>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '2rem' }} className={`grade-${mark.grade.toLowerCase()}`}>{mark.grade}</span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Grade</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
