import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
