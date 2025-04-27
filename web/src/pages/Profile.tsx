import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface UserProfile {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  joinDate: string;
  profilePicture?: string;
}

const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    message: password.length < minLength 
      ? 'Password must be at least 8 characters long'
      : !hasUpperCase 
        ? 'Password must contain at least one uppercase letter'
        : !hasLowerCase
          ? 'Password must contain at least one lowercase letter'
          : !hasNumbers
            ? 'Password must contain at least one number'
            : !hasSpecialChar
              ? 'Password must contain at least one special character'
              : ''
  };
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  return strength;
};

const getStrengthColor = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-blue-500';
    case 4:
      return 'bg-green-500';
    case 5:
      return 'bg-green-600';
    default:
      return 'bg-gray-200';
  }
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfile(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      setEmailError(validateEmail(value) ? '' : 'Please enter a valid email address');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'newPassword') {
      const validation = validatePassword(value);
      setPasswordError(validation.isValid ? '' : validation.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast.error('Please fix the email validation error');
      return;
    }

    try {
      await api.put('/users/me', formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refresh profile data
      const response = await api.get('/users/me');
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError) {
      toast.error('Please fix the password validation error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await api.put('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPicture(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await api.post('/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile picture updated successfully');
      // Refresh profile data
      const response = await api.get('/users/me');
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          {!isEditing && !isChangingPassword && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Change Password
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center space-x-6">
          <div className="relative">
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={profile.profilePicture || '/default-avatar.png'}
              alt="Profile"
            />
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-300 cursor-pointer hover:bg-gray-50"
            >
              <svg
                className="h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureUpload}
              disabled={isUploadingPicture}
            />
          </div>
          {isUploadingPicture && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-sm text-gray-500">Uploading...</span>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`mt-1 block w-full border ${
                    passwordError ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStrengthColor(
                            getPasswordStrength(passwordData.newPassword)
                          )} transition-all duration-300`}
                          style={{
                            width: `${(getPasswordStrength(passwordData.newPassword) / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {getPasswordStrength(passwordData.newPassword)}/5
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Password should contain at least 8 characters, including uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                )}
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`mt-1 block w-full border ${
                    passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!!passwordError || passwordData.newPassword !== passwordData.confirmPassword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Change Password
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="mt-1 text-sm text-gray-900">{profile.username}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p className="mt-1 text-sm text-gray-900">{profile.firstName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p className="mt-1 text-sm text-gray-900">{profile.lastName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1 text-sm text-gray-900">{profile.role}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(profile.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Account Actions</h2>
        <div className="mt-4">
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 