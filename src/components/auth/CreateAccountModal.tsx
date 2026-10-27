import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/NotificationContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Mail, Lock, GraduationCap, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide student name and email.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const newAcc = await signup(
        name.trim(),
        email.trim(),
        password,
        college.trim()
      );
      showToast('Account Created!', `Welcome to SkillBridge, ${newAcc.name}!`);
      setName('');
      setEmail('');
      setCollege('');
      setPassword('');
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Student Account"
      description="One person, one account. Enter your Gmail or university email to join SkillBridge."
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-[#FF2D95]/10 border border-[#FF2D95]/30 text-xs text-[#FF2D95] font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g., Jordan Miller"
            value={name}
            onChange={e => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="College or University"
            placeholder="e.g., Georgia Tech, MIT, Columbia University"
            value={college}
            onChange={e => setCollege(e.target.value)}
            icon={<GraduationCap className="w-4 h-4" />}
          />

          <Input
            label="Email Address / Gmail"
            type="email"
            placeholder="jordan.miller@gmail.com or univ.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password (min 6 characters)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202026]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              isLoading={isLoading}
              className="gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
