import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { usersService } from '../services/users.service';
import type { UpdateProfileDto } from '../types';
import { INDUSTRIES, INTERESTS, NETWORKING_GOALS } from '../utils/constants';
import PhotoUpload from './ui/PhotoUpload';
import MultiSelect from './ui/MultiSelect';
import toast from 'react-hot-toast';

export default function ProfileForm() {
  const { user, refreshUser } = useAuthStore();
  const [formData, setFormData] = useState<UpdateProfileDto>({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    bio: '',
    industries: [],
    interests: [],
    networkingGoals: [],
    linkedinUrl: '',
    twitterUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [bannerPhoto, setBannerPhoto] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        company: user.company || '',
        position: user.position || '',
        bio: user.bio || '',
        industries: user.industries || [],
        interests: user.interests || [],
        networkingGoals: user.networkingGoals || [],
        linkedinUrl: user.linkedinUrl || '',
        twitterUrl: user.twitterUrl || '',
      });
      setProfilePhoto(user.profilePhoto || '');
      setBannerPhoto(user.bannerPhoto || '');
    }
  }, [user]);

  const handleInputChange = (field: keyof UpdateProfileDto, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await usersService.updateProfile(formData);
      await refreshUser(); // Refresh user data in store
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photos Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Photos</h2>
          <div className="flex gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <PhotoUpload
                currentPhoto={profilePhoto}
                photoType="profile"
                onPhotoUpdate={setProfilePhoto}
                className="w-24 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Photo
              </label>
              <PhotoUpload
                currentPhoto={bannerPhoto}
                photoType="banner"
                onPhotoUpdate={setBannerPhoto}
                className="w-full h-32"
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Professional Information</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industries
            </label>
            <MultiSelect
              options={INDUSTRIES}
              value={formData.industries || []}
              onChange={(value) => handleInputChange('industries', value)}
              placeholder="Select your industries..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            <MultiSelect
              options={INTERESTS}
              value={formData.interests || []}
              onChange={(value) => handleInputChange('interests', value)}
              placeholder="Select your interests..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Networking Goals
            </label>
            <MultiSelect
              options={NETWORKING_GOALS}
              value={formData.networkingGoals || []}
              onChange={(value) => handleInputChange('networkingGoals', value)}
              placeholder="What are you looking to achieve?"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter URL
              </label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
