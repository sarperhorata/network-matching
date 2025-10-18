import { useState, useEffect } from 'react';
import { tenantsService, type TenantTheme } from '../services/tenants.service';
import { toast } from 'sonner';

interface TenantThemeSwitcherProps {
  tenantId: string;
  isAdmin?: boolean;
}

export default function TenantThemeSwitcher({ tenantId, isAdmin = false }: TenantThemeSwitcherProps) {
  const [theme, setTheme] = useState<TenantTheme>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
  });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadCurrentTheme();
  }, [tenantId]);

  useEffect(() => {
    if (previewMode) {
      applyThemeToDOM(theme);
    } else {
      loadCurrentTheme();
    }
  }, [previewMode, theme]);

  const loadCurrentTheme = async () => {
    try {
      const themeData = await tenantsService.getCurrentTheme();
      setTheme(themeData);
      applyThemeToDOM(themeData);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const applyThemeToDOM = (themeData: TenantTheme) => {
    const root = document.documentElement;
    
    if (themeData.primaryColor) {
      root.style.setProperty('--color-primary', themeData.primaryColor);
    }
    if (themeData.secondaryColor) {
      root.style.setProperty('--color-secondary', themeData.secondaryColor);
    }
    if (themeData.accentColor) {
      root.style.setProperty('--color-accent', themeData.accentColor);
    }
    if (themeData.fontFamily) {
      root.style.setProperty('--font-family', themeData.fontFamily);
    }
    if (themeData.borderRadius) {
      root.style.setProperty('--border-radius', themeData.borderRadius);
    }
  };

  const handleSaveTheme = async () => {
    if (!isAdmin) {
      toast.error('Sadece adminler tema güncelleyebilir');
      return;
    }

    setLoading(true);
    try {
      await tenantsService.updateTheme(tenantId, theme);
      toast.success('Tema başarıyla güncellendi!');
      setPreviewMode(false);
      applyThemeToDOM(theme);
    } catch (error: any) {
      console.error('Failed to update theme:', error);
      toast.error(error.message || 'Tema güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaultTheme: TenantTheme = {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      borderRadius: '0.5rem',
    };
    setTheme(defaultTheme);
  };

  if (!isAdmin) {
    return null; // Only show to admins
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Theme Customization</h2>
        <div className="flex items-center space-x-2">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              className="mr-2"
            />
            Live Preview
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Color Controls */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Colors</h3>
          
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.secondaryColor}
                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#10B981"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.accentColor}
                onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </div>

        {/* Typography & Layout */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Typography & Layout</h3>
          
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Inter">Inter (Default)</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <select
              value={theme.borderRadius}
              onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="0rem">None (Sharp)</option>
              <option value="0.25rem">Small</option>
              <option value="0.5rem">Medium (Default)</option>
              <option value="0.75rem">Large</option>
              <option value="1rem">Extra Large</option>
              <option value="9999px">Full (Pills)</option>
            </select>
          </div>

          {/* Preview Box */}
          <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
            <div className="space-y-2">
              <button
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: theme.borderRadius,
                  fontFamily: theme.fontFamily,
                }}
                className="w-full py-2 px-4 text-white font-medium"
              >
                Primary Button
              </button>
              <button
                style={{
                  backgroundColor: theme.secondaryColor,
                  borderRadius: theme.borderRadius,
                  fontFamily: theme.fontFamily,
                }}
                className="w-full py-2 px-4 text-white font-medium"
              >
                Secondary Button
              </button>
              <div
                style={{
                  borderColor: theme.accentColor,
                  borderRadius: theme.borderRadius,
                  fontFamily: theme.fontFamily,
                }}
                className="w-full py-2 px-4 border-2 text-center"
              >
                Accent Border
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset to Default
        </button>
        <button
          onClick={handleSaveTheme}
          disabled={loading}
          className={`flex-1 py-2 px-6 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Theme'}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Theme changes will apply to all users of this tenant immediately after saving.
        </p>
      </div>
    </div>
  );
}

