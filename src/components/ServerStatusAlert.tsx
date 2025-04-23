import React from 'react';

const ServerStatusAlert = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white p-3 text-center z-50 shadow-md">
      <div className="container mx-auto">
        <h2 className="text-lg font-bold mb-1">⚠️ Backend Server Not Available</h2>
        <p className="text-sm">
          The backend server is currently not responding. Login and register functions are unavailable.
        </p>
        <p className="text-xs mt-1">
          Contact the administrator or try again later.
        </p>
      </div>
    </div>
  );
};

export default ServerStatusAlert; 