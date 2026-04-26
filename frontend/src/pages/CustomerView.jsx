import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CustomerView = () => {
  const [ticket, setTicket] = useState(null);
  const [news, setNews] = useState([]);

  // --- SNAKE GAME STATE ---
  const GRID_SIZE = 20;
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Mobile Swipe State
  const [touchStart, setTouchStart] = useState(null);

  // 1. Fetch News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://www.theverge.com/rss/index.xml');
        setNews(res.data.items.map(item => ({ title: item.title, link: item.link })));
      } catch (e) {
        setNews([{ title: "Welcome to GRIET Smart Queue!", link: "#" }]);
      }
    };
    fetchNews();
  }, []);

  // 2. Snake Logic
  const moveSnake = useCallback(() => {
    if (gameOver || !isGameRunning || ticket?.status !== 'Waiting') return;
    const newSnake = [...snake];
    const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || newSnake.some(s => s.x === head.x && s.y === head.y)) {
      setGameOver(true); setIsGameRunning(false); return;
    }
    newSnake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      setScore(s => s + 1);
      setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
    } else { newSnake.pop(); }
    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isGameRunning, ticket]);

  // Desktop Controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    const interval = setInterval(moveSnake, 150);
    return () => { window.removeEventListener('keydown', handleKeyPress); clearInterval(interval); };
  }, [moveSnake, direction]);

  // --- MOBILE SWIPE CONTROLS ---
  const handleTouchStart = (e) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !isGameRunning) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    // Check if the swipe was long enough to count (prevents accidental taps)
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal Swipe
        if (dx > 0 && direction.x === 0) setDirection({ x: 1, y: 0 }); // Swipe Right
        else if (dx < 0 && direction.x === 0) setDirection({ x: -1, y: 0 }); // Swipe Left
      } else {
        // Vertical Swipe
        if (dy > 0 && direction.y === 0) setDirection({ x: 0, y: 1 }); // Swipe Down
        else if (dy < 0 && direction.y === 0) setDirection({ x: 0, y: -1 }); // Swipe Up
      }
    }
    setTouchStart(null);
  };

  // 3. Status Polling
  useEffect(() => {
    if (ticket && ticket.status !== 'Completed') {
      const interval = setInterval(async () => {
        const res = await axios.get('http://127.0.0.1:5000/api/tickets');
        const myTicket = res.data.find(t => t._id === ticket._id);
        if (myTicket) setTicket(myTicket);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [ticket]);

  const joinQueue = async () => {
    const res = await axios.post('http://127.0.0.1:5000/api/tickets');
    setTicket(res.data);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh', touchAction: 'none' }}>
      <style>{`
        @keyframes scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-180%); } }
        .ticker-wrap { width: 100%; overflow: hidden; background: #202124; padding: 15px 0; position: fixed; bottom: 0; left: 0; z-index: 1000; }
        .ticker-move { display: inline-block; white-space: nowrap; animation: scroll 60s linear infinite; }
        .ticker-move:hover { animation-play-state: paused; }
        .news-item { color: #8ab4f8; text-decoration: none; margin-right: 60px; font-weight: bold; }
      `}</style>

      <h1 style={{ color: '#1a73e8' }}>Smart Queue</h1>

      {!ticket ? (
        <div style={{ background: 'white', padding: '60px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginTop: '80px', display: 'inline-block' }}>
          <h2 style={{ marginBottom: '30px', color: '#333' }}>Tap to Join the Line</h2>
          <button onClick={joinQueue} style={{ padding: '20px 50px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '24px' }}>
            GET TICKET
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: '500px', margin: 'auto' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '15px', borderTop: '8px solid #1a73e8', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: 'bold' }}>YOUR TICKET</p>
            <h2 style={{ fontSize: '60px', margin: '10px 0' }}>#{ticket.ticketNumber}</h2>
            <p>Status: <strong style={{ color: '#1a73e8' }}>{ticket.status}</strong></p>
          </div>

          {ticket.status === 'Waiting' && (
            <div style={{ background: '#202124', padding: '20px', borderRadius: '20px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Snake Game 🐍</span>
                <span>Score: {score}</span>
              </div>
              
              {/* GAME BOARD WITH TOUCH EVENTS */}
              <div 
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{ width: '100%', maxWidth: '300px', height: '300px', backgroundColor: '#000', margin: 'auto', position: 'relative', border: '2px solid #444', display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
              >
                {(!isGameRunning || gameOver) && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                    <h3>{gameOver ? "GAME OVER" : "Ready to Play?"}</h3>
                    <button onClick={() => { setSnake([{ x: 10, y: 10 }]); setDirection({ x: 0, y: -1 }); setGameOver(false); setScore(0); setIsGameRunning(true); }} style={{ padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Start Game</button>
                  </div>
                )}
                {snake.map((seg, i) => <div key={i} style={{ gridColumnStart: seg.x + 1, gridRowStart: seg.y + 1, backgroundColor: i === 0 ? '#8ab4f8' : '#34a853', borderRadius: '2px' }} />)}
                <div style={{ gridColumnStart: food.x + 1, gridRowStart: food.y + 1, backgroundColor: '#ea4335', borderRadius: '50%' }} />
              </div>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#888' }}>Desktop: Arrow Keys | Mobile: Swipe</p>
            </div>
          )}

          {ticket.status === 'Serving' && (
            <div style={{ background: '#34a853', color: 'white', padding: '40px', borderRadius: '20px', fontSize: '24px', fontWeight: 'bold' }}>🎉 YOUR TURN!</div>
          )}
        </div>
      )}

      <div className="ticker-wrap">
        <div className="ticker-move">
          {news.map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noreferrer" className="news-item"> • {n.title}</a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerView;