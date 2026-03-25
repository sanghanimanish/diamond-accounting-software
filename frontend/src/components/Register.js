import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const res = await register(formData);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.errors || { general: res.message });
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <h1>Join the Team</h1>
                <p>Register to start exploring the platform.</p>
                
                {error?.general && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: '0.875rem' }}>{error.general}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        {error?.name && <div style={{ color: '#ef4444', fontSize: '12px' }}>{error.name[0]}</div>}
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                         {error?.email && <div style={{ color: '#ef4444', fontSize: '12px' }}>{error.email[0]}</div>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                         {error?.password && <div style={{ color: '#ef4444', fontSize: '12px' }}>{error.password[0]}</div>}
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            name="password_confirmation" 
                            className="form-control"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>
                
                <div style={{ marginTop: 24 }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Already have an account? </span>
                    <Link to="/login" className="link">Sign in instead</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
