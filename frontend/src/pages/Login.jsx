import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [enrollment_number, setEnrollmentNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : { name, email, password, enrollment_number, branch, semester: parseInt(semester) };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isLogin ? 'Login failed' : 'Registration failed'));
      }

      if (isLogin) {
        localStorage.setItem('nucleusToken', data.token);
        localStorage.setItem('nucleusUser', JSON.stringify({
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          enrollment_number: data.user.enrollment_number,
          branch: data.user.branch,
          semester: data.user.semester
        }));
        navigate('/dashboard');
      } else {
        localStorage.setItem('nucleusToken', data.token);
        localStorage.setItem('nucleusUser', JSON.stringify({
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          enrollment_number: data.user.enrollment_number,
          branch: data.user.branch,
          semester: data.user.semester
        }));
        navigate('/voice-enroll');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-on-surface">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isLogin
              ? 'Sign in to access your Nucleus portal'
              : 'Join Nucleus - Your University ERP System'}
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-on-surface"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">
                      Enrollment No.
                    </label>
                    <input
                      type="text"
                      value={enrollment_number}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-on-surface"
                      placeholder="EN2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      required
                      min="1"
                      max="8"
                      className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-on-surface"
                      placeholder="4"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-on-surface"
                    placeholder="Computer Science"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-on-surface"
                placeholder="your.email@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all text-on-surface"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-error-container border border-outline-variant/20 rounded-lg p-3">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-4">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}