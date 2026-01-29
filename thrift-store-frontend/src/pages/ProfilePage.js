import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Profile Image Section */}
          <div className="md:w-1/3 bg-gray-50 p-8 flex flex-col items-center">
            {currentUser.profilePic ? (
              <img 
                src={currentUser.profilePic} 
                alt={currentUser.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <h2 className="mt-4 text-xl font-semibold">{currentUser.name}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Account Type</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
                {currentUser.role}
              </span>
            </div>
            
            <div className="mt-8 w-full">
              <button 
                onClick={logout}
                className="w-full py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Profile Details Section */}
          <div className="md:w-2/3 p-8">
            <h3 className="text-xl font-semibold mb-6">Account Information</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                <p className="text-gray-800">{currentUser.name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                <p className="text-gray-800">{currentUser.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Account Created</h4>
                <p className="text-gray-800">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/orders" className="flex items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                    <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Your Orders</h4>
                      <p className="text-sm text-gray-600">View your order history</p>
                    </div>
                  </Link>
                  
                  {currentUser && currentUser.role !== 'seller' && (
                    <Link to="/become-seller" className="flex items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                      <div className="bg-green-100 text-green-800 p-3 rounded-full mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Become a Seller</h4>
                        <p className="text-sm text-gray-600">Start selling your items</p>
                      </div>
                    </Link>
                  )}
                  
                  <Link to="/cart" className="flex items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                    <div className="bg-accent bg-opacity-10 text-accent p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Your Cart</h4>
                      <p className="text-sm text-gray-600">View your shopping cart</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 