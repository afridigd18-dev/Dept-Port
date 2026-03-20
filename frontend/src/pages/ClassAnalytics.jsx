import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const ClassAnalytics = ({ classCode = 'CSE-A-2024' }) => {
  const [summary, setSummary] = useState(null);
  const [toppers, setToppers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, toppersRes] = await Promise.all([
          analyticsAPI.getClassSummary(classCode),
          analyticsAPI.getToppers(classCode)
        ]);
        setSummary(summaryRes.data.data);
        setToppers(toppersRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classCode]);

  if (loading) return <div>Loading Analytics...</div>;
  if (!summary) return <div>No data available for this class.</div>;

  const pieData = [
    { name: 'Pass', value: summary.passCount, color: '#10b981' },
    { name: 'Fail', value: summary.failCount, color: '#ef4444' }
  ];

  return (
    <div className="card">
      <h2>Class Performance Analytics - {classCode}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card" style={{ background: '#252525' }}>
          <h3>Pass/Fail Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <h2>{summary.passPercentage}% Pass Rate</h2>
          </div>
        </div>

        <div className="card" style={{ background: '#252525' }}>
          <h3>Class Toppers (Top 5)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={toppers}>
              <XAxis dataKey="studentId" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="finalTotal" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
            <div>
              <p>Average Score</p>
              <strong>{summary.averageFinal}</strong>
            </div>
            <div>
              <p>Highest Score</p>
              <strong>{summary.highestFinal}</strong>
            </div>
            <div>
              <p>Lowest Score</p>
              <strong>{summary.lowestFinal}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAnalytics;
