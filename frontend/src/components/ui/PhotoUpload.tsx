import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { usersService } from '../../services/users.service';

interface PhotoUploadProps {
  currentPhoto?: string;
  photoType: 'profile' | 'banner';
  onPhotoUpdate: (url: string) => void;
  className?: string;
}

export default function PhotoUpload({
  currentPhoto,
  photoType,
  onPhotoUpdate,
  className = ''
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const response = await usersService.uploadPhoto(file, photoType);
      onPhotoUpdate(response.url);
      toast.success(`${photoType === 'profile' ? 'Profile' : 'Banner'} photo updated successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors ${
          isUploading ? 'opacity-50 pointer-events-none' : ''
        }`}
        onClick={handleClick}
      >
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={`${photoType} photo`}
            className={`w-full h-full object-cover ${
              photoType === 'banner' ? 'h-32' : 'h-24 w-24 rounded-full'
            }`}
          />
        ) : (
          <div className={`flex items-center justify-center bg-gray-50 ${
            photoType === 'banner' ? 'h-32' : 'h-24 w-24 rounded-full'
          }`}>
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500 mt-1">
                {photoType === 'profile' ? 'Profile' : 'Banner'} Photo
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-sm">Uploading...</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className={`absolute bottom-2 right-2 px-2 py-1 text-xs rounded ${
          isUploading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        {currentPhoto ? 'Change' : 'Upload'}
      </button>
    </div>
  );
}
