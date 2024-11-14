import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/register.css';

const API_URL = import.meta.env.VITE_API_URL + "/auth"

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
          try {
            const response = await fetch(`${API_URL}/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password, username }),
            });
      
            if (!response.ok) {
              throw new Error('Registration failed');
            }
      
            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/admin');
          } catch (err) {
            setError(err.message);
          }
        };
      
        return (
          <div className="register-container">
            <h2 className="register-title">Register</h2>
            {error && <p className="register-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="register-form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="register-form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="register-form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="register-button">Register</button>
            </form>
          </div>
        );
      }
      
export default RegisterPage;
