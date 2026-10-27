import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Sparkles, Mail, Lock, User, GraduationCap, UserPlus, Eye, EyeOff } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, signupWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [college, setCollege] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleCollege, setGoogleCollege] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await signup(name.trim(), email.trim(), password, college.trim(), 'Email / Password');
      showToast('Account created!', `Welcome to SkillBridge! Registered as ${name.trim()}`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setError('Please enter your Google email address.');
      return;
    }
    const derivedName = googleName.trim() || googleEmail.trim().split('@')[0];

    try {
      setIsLoading(true);
      setError('');
      const { user: gUser, isNewUser } = await signupWithGoogle(
        derivedName,
        googleEmail.trim(),
        googleCollege.trim()
      );
      if (isNewUser) {
        showToast('Account created!', `Welcome to SkillBridge, ${gUser.name}!`);
      } else {
        showToast('Signed in with Google', `Welcome back, ${gUser.name}!`);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google registration failed.');
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
            Create Your Account
          </h1>
          <p className="text-xs text-[#8E8E9A]">
            One account per email. Publish your student projects, find freelance work, and build your verified portfolio.
          </p>
        </div>

        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30 text-xs text-[#FF2D95] font-medium leading-relaxed">
              {error}{' '}
              {error.includes('already have an account') && (
                <Link to="/login" className="underline font-bold text-white ml-1">
                  Click here to sign in
                </Link>
              )}
            </div>
          )}

          {/* Google Registration Option */}
          {!showGooglePrompt ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setShowGooglePrompt(true);
              }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#18181D] hover:bg-[#202026] border border-[#2A2A34] text-xs font-semibold text-[#F3F4F6] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.67c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.58-5.17 3.58-8.97z"
                />
                <path
                  fill="#34A853"
                  d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96h-4.01v3.14C3.515 21.3 7.565 24 12.255 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.535 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62h-4.01C.705 8.24.255 10.06.255 12s.45 3.76 1.27 5.38l4.01-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.525 6.62l4.01 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          ) : (
            <form
              onSubmit={handleGoogleSubmit}
              className="p-4 rounded-xl bg-[#18181D] border border-[#2A2A34] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F3F4F6]">
                  Register or Sign In with Google
                </span>
                <button
                  type="button"
                  onClick={() => setShowGooglePrompt(false)}
                  className="text-[11px] text-[#8E8E9A] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <Input
                label="Google Account Name"
                placeholder="e.g., Alex Chen"
                value={googleName}
                onChange={e => setGoogleName(e.target.value)}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                label="Google Email Address"
                type="email"
                placeholder="yourname@gmail.com"
                value={googleEmail}
                onChange={e => setGoogleEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="College / University (Optional)"
                placeholder="e.g., Stanford University"
                value={googleCollege}
                onChange={e => setGoogleCollege(e.target.value)}
                icon={<GraduationCap className="w-4 h-4" />}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full"
                disabled={isLoading}
                isLoading={isLoading}
              >
                Continue as Google User
              </Button>
            </form>
          )}

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#202026] w-full" />
            <span className="bg-[#121215] px-3 text-[10px] uppercase tracking-wider text-[#8E8E9A] font-mono">
              or email
            </span>
            <div className="border-t border-[#202026] w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g., Alex Chen or Priya Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="College or University"
              placeholder="e.g., UC Berkeley, Stanford, Harvard, MIT"
              value={college}
              onChange={e => setCollege(e.target.value)}
              icon={<GraduationCap className="w-4 h-4" />}
              helperText="Helps peers discover student builders from your campus."
            />

            <Input
              label="Student Email Address / Gmail"
              type="email"
              placeholder="yourname@gmail.com or student@univ.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password (min 6 characters)"
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 gap-2"
              disabled={isLoading}
              isLoading={isLoading}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8E8E9A]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#00A3E0] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
