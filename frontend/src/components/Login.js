import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const res = await login(credentials);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <h1>Welcome Back</h1>
                <p>Enter your credentials to access your dashboard.</p>
                
                {error && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: '0.875rem' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            className="form-control"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="form-control"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
                
                <div style={{ marginTop: 24 }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Don't have an account? </span>
                    <Link to="/register" className="link">Create workspace</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
