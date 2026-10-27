import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your account email.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter to confirm.');
      return;
    }

    try {
      setIsLoading(true);
      // Reset and confirm password in storage
      await resetPassword(email.trim(), newPassword);

      // Auto-log in user with newly confirmed password
      await login(email.trim(), newPassword, 'Password confirmed and reset');

      setSuccess(true);
      showToast('Password Confirmed', 'Your password has been updated and you are logged in!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 text-[#F3F4F6]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#FF2D95] flex items-center justify-center text-white shadow-md shadow-[#FF2D95]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
            Reset & Confirm Password
          </h1>
          <p className="text-xs text-[#8E8E9A]">
            Enter your account email, set a new password, and confirm to log in immediately.
          </p>
        </div>

        <div className="bg-[#121215] border border-[#202026] rounded-xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30 text-xs text-[#FF2D95] font-medium leading-relaxed">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#00A3E0]/10 border border-[#00A3E0]/30 text-[#00A3E0] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#F3F4F6]">Password Confirmed & Updated!</h3>
                <p className="text-xs text-[#8E8E9A] leading-relaxed">
                  Your new password is now active for <span className="font-semibold text-[#F3F4F6]">{email}</span>. You have been securely logged in.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                  className="w-full gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
                <Link to="/login" className="w-full">
                  <Button variant="outline" size="md" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Account Email Address"
                type="email"
                placeholder="yourname@gmail.com or student@univ.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#8E8E9A] mb-1">
                  New Password
                </label>
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 rounded text-[#8E8E9A] hover:text-[#F3F4F6] transition-colors focus:outline-hidden cursor-pointer"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-[#FF2D95]" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E9A] mb-1">
                  Confirm New Password
                </label>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password to confirm"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  icon={<ShieldCheck className="w-4 h-4" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 rounded text-[#8E8E9A] hover:text-[#F3F4F6] transition-colors focus:outline-hidden cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-[#FF2D95]" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full gap-2 mt-2"
                disabled={isLoading}
                isLoading={isLoading}
              >
                Confirm Password & Log In
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8E8E9A] hover:text-[#00A3E0] font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
