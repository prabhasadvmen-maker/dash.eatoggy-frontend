import React, { useState } from 'react';
import { useCustomerAuth } from '../../hooks/customer/useCustomerAuth.js';
import ProfileForm from '../../components/customer/ProfileForm.jsx';
import { FaUserCircle } from 'react-icons/fa';

const CustomerProfile = () => {
  const { profile, isLoadingProfile, updateProfile, isUpdatingProfile, deleteAccount, isDeletingAccount, logout, isLoggingOut } = useCustomerAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoadingProfile) return <div className="flex justify-center p-8">Loading profile...</div>;
  if (!profile) return <div className="flex justify-center p-8">Profile not found</div>;

  const handleUpdate = (data) => {
    updateProfile(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <FaUserCircle className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.mobile}</p>
          </div>
        </div>

        <ProfileForm profile={profile} onSubmit={handleUpdate} isLoading={isUpdatingProfile} />
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-4"
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
        >
          Delete Account
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Delete Account</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => deleteAccount("User requested deletion")}
                  disabled={isDeletingAccount}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
