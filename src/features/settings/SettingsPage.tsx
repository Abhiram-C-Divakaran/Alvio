import { useState } from 'react';
import { User, Mail, Camera, Save, Settings as SettingsIcon } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SettingsPage() {
  const { user, token } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    setIsSaving(true);
    setSaveMessage('');
    try {
      setSaveMessage('Use your Profile page to update your public profile. Account email changes are not available yet.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="flex-shrink-0 px-8 py-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Account Settings</h1>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mt-0.5">
              Manage your profile and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <Card className="p-8 border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)] shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">Profile Information</h2>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--color-bg-elevated)] border-2 border-[var(--color-border-subtle)] flex items-center justify-center shadow-inner">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-[var(--color-text-muted)]" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer backdrop-blur-sm">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <Input
                    label="Avatar URL"
                    icon={<Camera size={18} />}
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                  <p className="text-xs font-medium text-[var(--color-text-muted)] mt-2">
                    Provide a link to an image to use as your avatar.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  icon={<User size={18} />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
                <Input
                  label="Email Address"
                  icon={<Mail size={18} />}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-4 mt-4 pt-6 border-t border-[var(--color-border-subtle)]">
                {saveMessage && (
                  <span className={`text-sm ${saveMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                    {saveMessage}
                  </span>
                )}
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSaving}
                  className="w-32"
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
