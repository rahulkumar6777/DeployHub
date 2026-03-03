import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Helper function to get initial avatar
function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Profile() {
  const { user , fetchUser} = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const isGithubUser = user?.provider === 'github'
  
  // Form state
  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    profilePic: user?.profilePic || '',
    provider: user?.provider || 'email'
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  // Handle profile update — called only when Save button is explicitly clicked
  const handleUpdateProfile = async () => {
    if (!isEditing) return // extra guard: never runs unless in edit mode

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await api.put('/user/fullname', {
        fullname: formData.fullname,
      })

      if (res.status === 200) {
        setSuccess('Profile updated successfully!')
        await fetchUser();
        setIsEditing(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await api.put('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (res.status === 200) {
        setSuccess('Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Handle profile picture upload — only for email users
  const handleImageUpload = async (e) => {
    if (isGithubUser) return

    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB')
      return
    }

    const formData = new FormData()
    formData.append('profilePic', file)

    setLoading(true)
    setError(null)

    try {
      const res = await api.post('/user/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.status === 200) {
        setFormData(prev => ({ ...prev, profilePic: res.data.profilePic }))
        await fetchUser()
        setSuccess('Profile picture updated!')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: '#00e5ff' }}>Account</p>
        <h1 className="font-syne font-black text-[28px] text-white leading-none">Profile Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg flex items-center gap-2"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <svg className="w-4 h-4" style={{ color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm" style={{ color: '#f87171' }}>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg flex items-center gap-2"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <svg className="w-4 h-4" style={{ color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm" style={{ color: '#34d399' }}>{success}</span>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,184,204,0.1))',
                border: '2px solid rgba(0,229,255,0.2)'
              }}>
              {formData.profilePic ? (
                <img 
                  src={formData.profilePic} 
                  alt={formData.fullname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-syne font-black text-2xl" style={{ color: '#00e5ff' }}>
                    {getInitials(formData.fullname)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Upload button — hidden for GitHub users */}
            {!isGithubUser && (
              <>
                <label 
                  htmlFor="profile-pic-upload"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                  style={{ 
                    background: '#00e5ff',
                    boxShadow: '0 4px 12px rgba(0,229,255,0.3)'
                  }}>
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input 
                  type="file"
                  id="profile-pic-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
              </>
            )}
          </div>

          <div>
            <h2 className="font-syne font-black text-xl text-white mb-1">
              {formData.fullname || 'User'}
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  background: user?.verified ? 'rgba(52,211,153,0.08)' : 'rgba(245,158,11,0.08)',
                  color: user?.verified ? '#34d399' : '#f59e0b',
                  border: `1px solid ${user?.verified ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)'}`
                }}>
                {user?.verified ? 'Verified' : 'Unverified'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  background: 'rgba(156,163,175,0.08)',
                  color: '#9ca3af',
                  border: '1px solid rgba(156,163,175,0.2)'
                }}>
                {isGithubUser ? 'GitHub' : 'Email'}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Member since {formatDate(user?.createdAt)}
            </p>
            {/* Info message for GitHub users */}
            {isGithubUser && (
              <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Profile by GitHub.
              </p>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: '#9ca3af' }}>
              Full Name
            </label>
            {/* GitHub users: always read-only. Email users: editable when isEditing */}
            {isEditing && !isGithubUser ? (
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-white"
                style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  outline: 'none'
                }}
                placeholder="Enter your full name"
                disabled={loading}
              />
            ) : (
              <p className="text-sm text-white py-3">{formData.fullname || '—'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: '#9ca3af' }}>
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <p className="text-sm text-white py-3">{user?.email || '—'}</p>
              {isGithubUser && (
                <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ 
                    background: 'rgba(156,163,175,0.08)',
                    color: '#9ca3af',
                    border: '1px solid rgba(156,163,175,0.2)'
                  }}>
                  Managed by GitHub
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons — only shown to email/local users */}
          {!isGithubUser && (
            <div className="flex items-center gap-3 pt-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    style={{ 
                      background: 'linear-gradient(135deg, #00e5ff, #00b8cc)',
                      boxShadow: '0 4px 16px rgba(0,229,255,0.2)'
                    }}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        fullname: user?.fullname || '',
                        email: user?.email || '',
                        profilePic: user?.profilePic || '',
                        provider: user?.provider || 'email'
                      })
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#9ca3af'
                    }}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff'
                  }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Change Card — only for email/local users */}
      {!isGithubUser && (
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          
          <h2 className="font-syne font-bold text-lg text-white mb-4">Change Password</h2>

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: '#9ca3af' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    outline: 'none'
                  }}
                  placeholder="Enter current password"
                  required
                  disabled={loading}
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: '#9ca3af' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    outline: 'none'
                  }}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold tracking-[0.1em] uppercase mb-2" style={{ color: '#9ca3af' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    outline: 'none'
                  }}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Requirements */}
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#9ca3af' }}>Password Requirements:</p>
                <ul className="text-xs space-y-1" style={{ color: '#6b7280' }}>
                  <li className="flex items-center gap-2">
                    <span className={`w-1 h-1 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                    At least 6 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                    At least one uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-1 h-1 rounded-full ${/[0-9]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                    At least one number
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{ 
                    background: 'linear-gradient(135deg, #00e5ff, #00b8cc)',
                    boxShadow: '0 4px 16px rgba(0,229,255,0.2)'
                  }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{ 
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#9ca3af'
                  }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff'
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Change Password
            </button>
          )}
        </div>
      )}

      {/* Account Stats Card */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        <h2 className="font-syne font-bold text-lg text-white mb-4">Account Statistics</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-bold tracking-[0.1em] uppercase mb-1" style={{ color: '#9ca3af' }}>Account Age</p>
            <p className="text-lg font-syne font-bold text-white">
              {user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0} days
            </p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-bold tracking-[0.1em] uppercase mb-1" style={{ color: '#9ca3af' }}>Current Plan</p>
            <p className="text-lg font-syne font-bold text-white capitalize">
              {user?.subscriptionid?.plan || 'free'}
            </p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-bold tracking-[0.1em] uppercase mb-1" style={{ color: '#9ca3af' }}>Last Updated</p>
            <p className="text-sm font-syne font-bold text-white">
              {formatDate(user?.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl p-6"
        style={{ background: 'rgba(248,113,113,0.02)', border: '1px solid rgba(248,113,113,0.1)' }}>
        
        <h2 className="font-syne font-bold text-lg text-white mb-2">Danger Zone</h2>
        <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Irreversible and destructive actions</p>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-white">Delete Account</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>Permanently delete your account and all data</p>
          </div>
          <button
            className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{ 
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171'
            }}>
            Delete Account
          </button>
        </div>
      </div>

    </div>
  )
}

export default Profile