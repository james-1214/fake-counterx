import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/adminapi';
import styles from '../styles/AdminLogin.module.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ FIX: Pass email and password as separate parameters
      const response = await loginAdmin(form.email, form.password);

      if (response) {
        console.log('✅ Login successful, token stored');
        // Navigate to admin dashboard on successful login
        navigate('/admin-dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const status = err?.response?.status;
      
      if (status === 401 || status === 403) {
        setError('Invalid email or password.');
      } else if (status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleLogin}>
        <h1>Admin Login</h1>

        {error && (
          <p style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Admin Email"
          value={form.email}
          required
          disabled={loading}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          required
          disabled={loading}
          onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;