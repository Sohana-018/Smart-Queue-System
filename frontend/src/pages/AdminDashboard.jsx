import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/tickets');
      setTickets(res.data);
    } catch (e) { console.error("Fetch error", e); }
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

  // --- BULLETPROOF DATA ANALYSIS ---
  const calculateAvgWait = () => {
    // 1. Filter out any tickets missing timestamps (The NaN killers)
    const validTickets = completed.filter(t => t.joinedAt && t.completedAt);
    
    if (validTickets.length === 0) return "0.0";

    // 2. Safely calculate the total time
    const totalMillis = validTickets.reduce((acc, t) => {
      const diff = new Date(t.completedAt) - new Date(t.joinedAt);
      return acc + diff;
    }, 0);

    const avgMinutes = totalMillis / validTickets.length / 60000;
    
    // 3. Final safety check before displaying
    return isNaN(avgMinutes) ? "0.0" : avgMinutes.toFixed(1);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#202124', marginBottom: '30px' }}>Staff Analytics Dashboard</h1>
      
      {/* STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={card}>
          <h3 style={statNumber}>{tickets.length}</h3>
          <p style={statLabel}>Total Queue</p>
        </div>
        <div style={card}>
          <h3 style={statNumber}>{completed.length}</h3>
          <p style={statLabel}>Served Today</p>
        </div>
        <div style={card}>
          <h3 style={statNumber}>{calculateAvgWait()} <span style={{fontSize: '20px'}}>min</span></h3>
          <p style={statLabel}>Avg Wait Time</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        {/* ACTIVE SERVICE */}
        <div style={panel}>
          <h2 style={{ borderBottom: '2px solid #f0f2f5', paddingBottom: '15px', marginTop: 0 }}>Active Service</h2>
          {serving ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h1 style={{ fontSize: '80px', margin: '20px 0', color: '#1a73e8' }}>#{serving.ticketNumber}</h1>
              <button onClick={() => updateStatus(serving._id, 'Completed')} style={btnDanger}>FINISH & EXIT</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: '20px', color: '#666', marginBottom: '30px' }}>Counter is Ready</p>
              {waiting.length > 0 ? (
                <button onClick={() => updateStatus(waiting[0]._id, 'Serving')} style={btnPrimary}>CALL NEXT TICKET</button>
              ) : (
                <p style={{ color: '#999' }}>No one is waiting.</p>
              )}
            </div>
          )}
        </div>

        {/* WAITING LINE */}
        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Waiting Line ({waiting.length})</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {waiting.map(t => (
              <div key={t._id} style={{ padding: '15px', borderBottom: '1px solid #f0f2f5', fontSize: '22px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>Ticket #{t.ticketNumber}</span>
                <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal', alignSelf: 'center' }}>Waiting</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const card = { background: '#fff', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const statNumber = { fontSize: '48px', margin: '0 0 10px 0', color: '#202124' };
const statLabel = { margin: 0, color: '#5f6368', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' };
const panel = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const btnPrimary = { padding: '18px 40px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', width: '100%' };
const btnDanger = { padding: '18px 40px', background: '#d93025', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', width: '100%' };

export default AdminDashboard;