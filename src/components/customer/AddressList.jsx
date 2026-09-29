import React from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

const AddressList = ({ addresses, onEdit, onDelete, onSetDefault, loading, error }) => {
  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  if (error) return <div className="text-red-500 text-center p-4">Error loading addresses</div>;
  if (!addresses || addresses.length === 0) return <div className="text-gray-500 text-center p-8">No addresses found. Add a new delivery address.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <div key={address._id || address.id} className={`border rounded-lg p-4 relative ${address.isDefault ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
          {address.isDefault && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center">
              <FaCheckCircle className="mr-1" /> Default
            </span>
          )}
          
          <div className="flex items-start mb-2">
            <FaMapMarkerAlt className="text-orange-500 mt-1 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">{address.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{address.mobile}</p>
              <p className="text-sm text-gray-700">
                {address.addressLine1}, {address.landmark && `${address.landmark}, `}
                {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
          </div>

          <div className="mt-4 flex space-x-3 text-sm">
            <button onClick={() => onEdit(address)} className="text-blue-600 hover:text-blue-800 flex items-center">
              <FaEdit className="mr-1" /> Edit
            </button>
            <button onClick={() => onDelete(address._id || address.id)} className="text-red-600 hover:text-red-800 flex items-center">
              <FaTrash className="mr-1" /> Delete
            </button>
            {!address.isDefault && (
              <button onClick={() => onSetDefault(address._id || address.id)} className="text-orange-600 hover:text-orange-800 ml-auto font-medium">
                Set as Default
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
