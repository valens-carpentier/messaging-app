import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000/api/auth";

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      {/* Add your admin page content here */}
    </div>
  );
}

export default AdminPage;
