import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/profile.css';

const API_URL = import.meta.env.VITE_API_URL;

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState({
    avatar: false,
    bio: false
  });
  const [formData, setFormData] = useState({
    avatar: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        avatar: data.profile?.avatar || '',
        bio: data.profile?.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (field) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      setSuccess('Profile updated successfully!');
      setError('');
      setEditMode(prev => ({...prev, [field]: false}));
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      setSuccess('');
    }
  };

  return (
    <div className="admin-container">
      <div className="header">
        <div className="header-top">
          <button className="back-button" onClick={() => navigate('/admin')}>
            ← Back to Messages
          </button>
          <h1 className="header-title">Your Profile</h1>
          <button className="nav-button logout" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>Logout</button>
        </div>
      </div>

      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {profile && (
          <div className="profile-fields">
            <div className="profile-field static">
              <span className="field-label">Username</span>
              <span className="field-value">{profile.username}</span>
            </div>

            <div className="profile-field static">
              <span className="field-label">Email</span>
              <span className="field-value">{profile.email}</span>
            </div>

            <div className="profile-field editable">
              <span className="field-label">Avatar URL</span>
              {editMode.avatar ? (
                <div className="field-edit">
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="Enter avatar URL"
                  />
                  <div className="edit-buttons">
                    <button onClick={() => handleSubmit('avatar')} className="save-button">Save</button>
                    <button onClick={() => setEditMode(prev => ({...prev, avatar: false}))} className="cancel-button">Cancel</button>
                  </div>
                </div>
              ) : (
                <span className="field-value clickable" onClick={() => setEditMode(prev => ({...prev, avatar: true}))}>
                  {formData.avatar || 'Click to add avatar URL'}
                </span>
              )}
            </div>

            <div className="profile-field editable">
              <span className="field-label">Bio</span>
              {editMode.bio ? (
                <div className="field-edit">
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows="4"
                  />
                  <div className="edit-buttons">
                    <button onClick={() => handleSubmit('bio')} className="save-button">Save</button>
                    <button onClick={() => setEditMode(prev => ({...prev, bio: false}))} className="cancel-button">Cancel</button>
                  </div>
                </div>
              ) : (
                <span className="field-value clickable" onClick={() => setEditMode(prev => ({...prev, bio: true}))}>
                  {formData.bio || 'Click to add bio'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;