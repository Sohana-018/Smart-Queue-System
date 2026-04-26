import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerView from './pages/CustomerView';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main page for customers */}
        <Route path="/" element={<CustomerView />} />
        
        {/* The hidden page for staff */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;