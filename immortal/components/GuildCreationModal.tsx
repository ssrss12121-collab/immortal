import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Guild } from '../types';

interface GuildCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (guild: Guild) => void;
  userId: string;
  userToken: string;
}

const GuildCreationModal: React.FC<GuildCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userToken,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    customLink: '',
    description: '',
  });
  const [linkAvailable, setLinkAvailable] = useState<boolean | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateCustomLink = (link: string): boolean => {
    // Must start with TR. and contain only alphanumeric, underscore, hyphen
    const regex = /^TR\.[a-zA-Z0-9_-]+$/;
    return regex.test(link);
  };

  const checkLinkAvailability = async (link: string) => {
    if (!validateCustomLink(link)) {
      setLinkAvailable(false);
      return;
    }

    setIsCheckingLink(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guilds/search?link=${link}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status === 404) {
        // Link is available
        setLinkAvailable(true);
      } else if (response.ok) {
        // Link already exists
        setLinkAvailable(false);
      }
    } catch (err) {
      console.error('Error checking link:', err);
      setLinkAvailable(null);
    } finally {
      setIsCheckingLink(false);
    }
  };

  const handleCustomLinkChange = (value: string) => {
    setFormData({ ...formData, customLink: value });
    setLinkAvailable(null);
    
    // Auto-check after typing stops (debounce)
    if (value.length >= 4) {
      setTimeout(() => {
        if (formData.customLink === value) {
          checkLinkAvailability(value);
        }
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Guild name is required');
      return;
    }

    if (!validateCustomLink(formData.customLink)) {
      setError('Custom link must start with TR. and contain only letters, numbers, - or _');
      return;
    }

    if (linkAvailable === false) {
      setError('This custom link is already taken');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guilds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          customLink: formData.customLink,
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.guild);
        onClose();
        // Reset form
        setFormData({ name: '', customLink: '', description: '' });
        setLinkAvailable(null);
      } else {
        setError(data.message || 'Failed to create guild');
      }
    } catch (err) {
      console.error('Error creating guild:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Create Guild</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Guild Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Guild Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter guild name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              maxLength={50}
              required
            />
          </div>

          {/* Custom Link */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Link *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.customLink}
                onChange={(e) => handleCustomLinkChange(e.target.value)}
                placeholder="TR.myguild"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                maxLength={30}
                required
              />
              {isCheckingLink && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!isCheckingLink && linkAvailable === true && (
                <Check size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
              {!isCheckingLink && linkAvailable === false && (
                <X size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must start with TR. (e.g., TR.myguild)
            </p>
            {linkAvailable === true && (
              <p className="text-xs text-green-500 mt-1">✓ Link is available</p>
            )}
            {linkAvailable === false && (
              <p className="text-xs text-red-500 mt-1">✗ Link is already taken</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your guild..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !linkAvailable || !formData.name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Guild'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuildCreationModal;
