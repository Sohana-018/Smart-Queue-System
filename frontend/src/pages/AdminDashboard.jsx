import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    const res = await axios.get('http://127.0.0.1:5000/api/tickets');
    setTickets(res.data);
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    await axios.patch(`http://127.0.0.1:5000/api/tickets/${id}`, { status: newStatus });
    fetchTickets();
  };

  const waiting = tickets.filter(t => t.status === 'Waiting');
  const serving = tickets.find(t => t.status === 'Serving');
  const completed = tickets.filter(t => t.status === 'Completed');

  const calculateAvgWait = () => {
    if (completed.length === 0) return 0;
    const total = completed.reduce((acc, t) => acc + (new Date(t.completedAt) - new Date(t.joinedAt)), 0);
    return (total / completed.length / 60000).toFixed(1);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1>Staff Analytics Dashboard</h1>
      
      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={card}><h3>{tickets.length}</h3><p>Total Queue</p></div>
        <div style={card}><h3>{completed.length}</h3><p>Served Today</p></div>
        <div style={card}><h3>{calculateAvgWait()} min</h3><p>Avg Wait Time</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        <div style={panel}>
          <h2>Active Service</h2>
          {serving ? (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '70px', color: '#1a73e8' }}>#{serving.ticketNumber}</h1>
              <p>Customer: <strong>{serving.customerName}</strong></p>
              <button onClick={() => updateStatus(serving._id, 'Completed')} style={btnDanger}>FINISH & EXIT</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Ready for next?</p>
              {waiting.length > 0 && <button onClick={() => updateStatus(waiting[0]._id, 'Serving')} style={btnPrimary}>CALL NEXT</button>}
            </div>
          )}
        </div>

        <div style={panel}>
          <h3>Waiting Line ({waiting.length})</h3>
          {waiting.map(t => <div key={t._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>#{t.ticketNumber} - {t.customerName}</div>)}
        </div>
      </div>
    </div>
  );
};

const card = { background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const panel = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const btnPrimary = { padding: '15px 30px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const btnDanger = { padding: '15px 30px', background: '#d93025', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };

export default AdminDashboard;