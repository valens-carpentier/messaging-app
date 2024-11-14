import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';

const API_URL = import.meta.env.VITE_API_URL + "/auth"

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
  
        if (!response.ok) {
          throw new Error('Login failed');
        }
  
        const data = await response.json();
        console.log('Login response:', data);
  
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('Token stored:', localStorage.getItem('token'));
          navigate('/admin');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('Login failed');
      }
    };
  
    return (
      <div className="login-container">
        <h2 className="login-title">Login</h2>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-actions">
            <button type="submit" className="login-button">Login</button>
            <button 
              type="button" 
              className="register-link-button"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  export default LoginPage;