import React, { useState, useEffect } from 'react';
import { marksAPI } from '../services/api';
import { Save, AlertCircle } from 'lucide-react';

const FacultyMarkEntry = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    classCode: 'CSE-A-2024',
    subject: 'Data Structures',
    cie1: 0, cie2: 0, cie3: 0,
    assignmentMark: 0, attendanceMark: 0, recordMark: 0, onlineTestMark: 0,
    semesterMark: 0
  });

  const [preview, setPreview] = useState({
    internalTotal: 0,
    semesterConverted: 0,
    finalTotal: 0,
    result: 'FAIL',
    grade: 'RA'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Live Preview Calculation (Mimics Backend Logic)
  useEffect(() => {
    const c1 = (formData.cie1 / 50) * 10;
    const c2 = (formData.cie2 / 50) * 10;
    const c3 = (formData.cie3 / 50) * 10;
    
    const internalTotal = parseFloat((c1 + c2 + c3 + 
      formData.assignmentMark + 
      formData.attendanceMark + 
      formData.recordMark + 
      formData.onlineTestMark).toFixed(2));

    const semesterConverted = parseFloat(((formData.semesterMark / 100) * 50).toFixed(2));
    const finalTotal = parseFloat((internalTotal + semesterConverted).toFixed(2));
    
    let result = finalTotal >= 50 ? 'PASS' : 'FAIL';
    let grade = 'RA';
    
    if (finalTotal >= 90) grade = 'O';
    else if (finalTotal >= 80) grade = 'A+';
    else if (finalTotal >= 70) grade = 'A';
    else if (finalTotal >= 60) grade = 'B+';
    else if (finalTotal >= 50) grade = 'B';

    setPreview({ internalTotal, semesterConverted, finalTotal, result, grade });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'studentId' || name === 'classCode' || name === 'subject' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await marksAPI.add(formData);
      setSuccess('Marks added successfully!');
      // Reset form or studentId
      setFormData(prev => ({ ...prev, studentId: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Faculty Marks Entry</h2>
      {error && <div className="badge badge-fail"><AlertCircle size={16}/> {error}</div>}
      {success && <div className="badge badge-pass">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label>Student ID</label>
            <input name="studentId" value={formData.studentId} onChange={handleChange} required />
          </div>
          <div>
            <label>Subject</label>
            <input name="subject" value={formData.subject} onChange={handleChange} required />
          </div>

          <div>
            <label>CIE 1 (50)</label>
            <input type="number" name="cie1" value={formData.cie1} onChange={handleChange} max="50" min="0" />
          </div>
          <div>
            <label>CIE 2 (50)</label>
            <input type="number" name="cie2" value={formData.cie2} onChange={handleChange} max="50" min="0" />
          </div>
          <div>
            <label>CIE 3 (50)</label>
            <input type="number" name="cie3" value={formData.cie3} onChange={handleChange} max="50" min="0" />
          </div>
          <div>
            <label>Semester (100)</label>
            <input type="number" name="semesterMark" value={formData.semesterMark} onChange={handleChange} max="100" min="0" />
          </div>

          <div>
            <label>Assignment (5)</label>
            <input type="number" name="assignmentMark" value={formData.assignmentMark} onChange={handleChange} max="5" min="0" />
          </div>
          <div>
            <label>Attendance (5)</label>
            <input type="number" name="attendanceMark" value={formData.attendanceMark} onChange={handleChange} max="5" min="0" />
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem', background: '#252525' }}>
          <h3>Auto-Calculation Preview</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p>Internal (50)</p>
              <strong>{preview.internalTotal}</strong>
            </div>
            <div>
              <p>Semester (50)</p>
              <strong>{preview.semesterConverted}</strong>
            </div>
            <div>
              <p>Final (100)</p>
              <h2 style={{ margin: 0 }}>{preview.finalTotal}</h2>
            </div>
            <div>
              <p>Grade</p>
              <h2 className={`grade-${preview.grade.toLowerCase()}`}>{preview.grade}</h2>
            </div>
            <div>
              <p>Status</p>
              <span className={`badge badge-${preview.result.toLowerCase()}`}>{preview.result}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
          {loading ? 'Submitting...' : <><Save size={18}/> Submit Marks</>}
        </button>
      </form>
    </div>
  );
};

export default FacultyMarkEntry;
