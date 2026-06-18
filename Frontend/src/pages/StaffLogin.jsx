import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ← lowercase 'authapi' to match the actual filename on disk (Linux-safe)
import { loginAdmin, storeAuthToken, storeUserRole, storeUserProfile, decodeToken } from '../api/authapi';
import styles from '../styles/StaffLogin.module.css';

const StaffLogin = () => {
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send { username: <email value>, password } — backend LoginDTO uses
      // @JsonAlias("email") so both keys are accepted.
      const response = await loginAdmin({
        username: form.email,   // ← key the backend actually reads
        password: form.password,
      });

      const token =
        typeof response === 'string'
          ? response
          : response?.token || response?.accessToken || null;

      if (token) {
        storeAuthToken(token);
        const decoded = decodeToken(token);
        const role = decoded?.role || decoded?.roles?.[0] || 'STAFF';
        storeUserRole(role);
        storeUserProfile(decoded || { email: form.email, role });
      } else {
        storeUserRole('STAFF');
        storeUserProfile(response || { email: form.email });
      }

      localStorage.setItem(
        'user',
        JSON.stringify({ role: 'staff', email: form.email })
      );

      navigate('/kitchen');
    } catch (err) {
      console.error('Staff login error:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Invalid email or password.');
      } else if (status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleLogin}>
        <h1>Staff Login</h1>

        {error && (
          <p style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Staff Email"
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
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default StaffLogin;
