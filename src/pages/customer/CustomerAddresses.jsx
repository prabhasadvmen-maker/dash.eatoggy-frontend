import React, { useState } from 'react';
import { useAddresses } from '../../hooks/customer/useAddresses.js';
import AddressList from '../../components/customer/AddressList.jsx';
import AddressForm from '../../components/customer/AddressForm.jsx';

const CustomerAddresses = () => {
  const { addresses, isLoading, addAddress, isAdding, updateAddress, isUpdating, deleteAddress, isDeleting } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddClick = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress(id);
    }
  };

  const handleSetDefault = (id) => {
    // In our backend, updating isDefault might require passing other fields or a dedicated endpoint.
    // Assuming backend handles it if we pass { isDefault: true } via patch
    const addr = addresses.find(a => a._id === id || a.id === id);
    if (addr) updateAddress({ id, data: { ...addr, isDefault: true } });
  };

  const handleFormSubmit = async (data) => {
    if (editingAddress) {
      await updateAddress({ id: editingAddress._id || editingAddress.id, data });
    } else {
      await addAddress(data);
    }
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 shadow-sm font-medium"
        >
          + Add New Address
        </button>
      </div>

      <AddressList
        addresses={addresses}
        loading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onSetDefault={handleSetDefault}
      />

      {showForm && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="relative inline-block text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <AddressForm
                initialData={editingAddress}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={isAdding || isUpdating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddresses;
