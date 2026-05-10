import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfileEditModal({ isOpen, onClose, onSuccess }: ProfileEditModalProps) {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    expertise: user?.expertise || '',
  });

  // Update form data when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        expertise: user.expertise || '',
      });
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError(t('profile.nameRequired') || 'Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Filter out empty values
      const updates: Record<string, unknown> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.trim()) {
          updates[key] = value;
        }
      });

      await apiService.updateUser(updates);
      
      // Refresh user data from server to ensure all changes are saved
      const currentUserResponse = await apiService.getCurrentUser();
      updateUser(currentUserResponse);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('profile.editProfile') || 'Edit Profile'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Card className="bg-red-50 border-red-200 p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </Card>
          )}

          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              {t('profile.fullName') || 'Full Name'} *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="nickname" className="text-sm font-medium">
              {t('profile.nickname') || 'Nickname'}
            </Label>
            <Input
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="Display name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="avatar" className="text-sm font-medium">
              {t('profile.avatarUrl') || 'Avatar URL'}
            </Label>
            <Input
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              type="url"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm font-medium">
              {t('profile.bio') || 'Bio'}
            </Label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="mt-1 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <Label htmlFor="github" className="text-sm font-medium">
              {t('alumni.github') || 'GitHub URL'}
            </Label>
            <Input
              id="github"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              type="url"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="linkedin" className="text-sm font-medium">
              {t('alumni.linkedin') || 'LinkedIn URL'}
            </Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              type="url"
              className="mt-1"
            />
          </div>

          {user?.role === 'alumni' && (
            <div>
              <Label htmlFor="expertise" className="text-sm font-medium">
                {t('profile.expertise') || 'Expertise'}
              </Label>
              <select
                id="expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{t('profile.selectExpertise') || 'Select expertise'}</option>
                <option value="AI">AI</option>
                <option value="Web">Web</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
