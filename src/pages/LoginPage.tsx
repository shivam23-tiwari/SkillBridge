import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Sparkles, Lock, Mail, MessageSquare, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await login(email.trim(), password, loginMessage.trim());
      showToast('Logged in successfully', 'Welcome back! Owner notification dispatched.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 text-[#F3F4F6]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#FF2D95] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
            Sign in to SkillBridge
          </h1>
          <p className="text-xs text-[#8E8E9A]">
            Enter your personal email address and password to access your account.
          </p>
        </div>

        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30 text-xs text-[#FF2D95] font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email Address"
              type="email"
              placeholder="e.g., yourname@university.edu or gmail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#8E8E9A]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#00A3E0] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded text-[#8E8E9A] hover:text-[#F3F4F6] transition-colors focus:outline-hidden cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#FF2D95]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />
            </div>

            {/* Optional message box as requested by user */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#8E8E9A] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#00A3E0]" />
                  Optional Message to Owner
                </label>
                <span className="text-[10px] text-[#00A3E0] font-mono">Optional</span>
              </div>
              <Textarea
                placeholder="Leave an optional note for the owner (e.g. 'Looking to hire developers for a React contract', 'Signing in for project review')..."
                value={loginMessage}
                onChange={e => setLoginMessage(e.target.value)}
                rows={2}
              />
              <p className="text-[10px] text-[#8E8E9A] mt-1">
                Dispatches an instant alert with your login time to the owner's Gmail inbox.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8E8E9A]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#00A3E0] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
