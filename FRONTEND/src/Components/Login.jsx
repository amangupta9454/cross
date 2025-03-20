import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const { username, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting:', { username, password });
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            console.log('API Response:', res.data);
            localStorage.setItem('token', res.data.token);
            setMessage('Login successful!');
            console.log('User Role:', res.data.user.role);
            if (res.data.user.role === 'admin') {
                console.log('Navigating to /admin-panel');
                navigate('/admin-panel');
            } else {
                console.log('Not an admin, staying on login page');
            }
        } catch (err) {
            console.error('Error:', err.response?.data);
            setMessage(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <div>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={onChange}
                        placeholder="Username"
                        required
                        style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Password"
                        required
                        style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                    />
                </div>
                <button
                    type="submit"
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                    Login
                </button>
            </form>
            {message && <p style={{ marginTop: '20px' }}>{message}</p>}
        </div>
    );
};

export default Login;