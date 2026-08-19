import React, { useState } from 'react';
import api from '../../services/api';
import './profile.css';

const ProfileEdit = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    headline: profile.headline || '',
    location: profile.location || '',
    bio: profile.bio || '',
    skills: profile.skills?.map(s => s.name).join(', ') || '',
    education: profile.education || [],
    experience: profile.experience || []
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'education' && key !== 'experience') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add skills as array
      const skillsArray = formData.skills.split(',').map(s => s.trim());
      formDataToSend.append('skills', JSON.stringify(skillsArray));

      // Add education and experience
      formDataToSend.append('education', JSON.stringify(formData.education));
      formDataToSend.append('experience', JSON.stringify(formData.experience));

      // Add image if uploaded
      if (imageFile) {
        formDataToSend.append('profilePicture', imageFile);
      }

      await api.put('/users/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {imageFile && (
              <div className="image-preview">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Headline</label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g., Software Engineer at Google"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div className="form-group">
            <label>About/Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Python"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;