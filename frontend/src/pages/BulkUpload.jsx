import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/marks/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Bulk Upload Marks (CSV)</h2>
      <p style={{ color: '#888' }}>Upload a CSV file with columns: <code>registerNumber, subject, cie1, cie2, cie3, assignmentMark, attendanceMark, recordMark, onlineTestMark, semesterMark</code></p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div style={{ border: '2px dashed #444', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
          <Upload size={48} color="#444" style={{ marginBottom: '1rem' }} />
          <input type="file" onChange={handleFileChange} accept=".csv" required />
        </div>

        <button 
          type="submit" 
          disabled={loading || !file} 
          style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', marginTop: '1rem', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Upload & Process CSV'}
        </button>
      </form>

      {result && (
        <div className="card" style={{ background: '#101010', marginTop: '2rem' }}>
          <h3 style={{ color: '#10b981' }}><CheckCircle size={18}/> Success: {result.count} records processed</h3>
          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ color: '#f87171' }}><AlertCircle size={16}/> Row Errors:</h4>
              <ul style={{ fontSize: '0.8rem', color: '#f87171' }}>
                {result.errors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
