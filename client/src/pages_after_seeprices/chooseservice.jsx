import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEllipsisH, FaTimes, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from "../store/auth"; // Import the auth context

export const Chooseservice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearLocationState } = useAuth(); // Get clear function from context
  
  // Get the selected service and locations from navigation state
  // These should always come from Seeprices navigation
  const { service = 'Ambulance', pickup = 'Unknown Location', drop = 'Unknown Destination' } = location.state || {};

  const [showOptions, setShowOptions] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(true);

  // Simulate driver search progress
  useEffect(() => {
    if (!isSearching) return;

    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSearching]);

  const cancelSearch = () => {
    setIsSearching(false);
    clearLocationState(); // Clear the location state when cancelling
    // Navigate back to previous page after a delay
    setTimeout(() => navigate(-1), 1000);
  };

  const confirmDetails = () => {
    // Navigate to confirmation page with all details
    navigate('/confirmation', { state: { service, pickup, drop } });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Full-width container */}
      <div className="container mx-auto p-8">
        {/* Flex container for map and service details */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map Section (Left Side) - Same as Seeprices */}
          <div className="lg:w-1/2">
            <img
              src="/images/map.png"
              alt="Map"
              className="w-full rounded-lg shadow-md"
            />
          </div>

          {/* Service Status Section (Right Side) */}
          <div className="lg:w-1/2 flex flex-col gap-8 w-full">
            {/* Header */}
            <div className="text-5xl font-bold p-10 text-gray-800 self-center">
              {service} Requested
            </div>

            {/* Status Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              {/* Service Type and Price */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{service}</h2>
                <div className="flex items-center">
                  <img src="/src/assets/rupee.svg" alt="rupee" className="h-6 mr-1" />
                  <span className="text-2xl font-semibold">
                    {service === 'Ambulance' ? '2000' : '10000'}
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-lg font-medium text-gray-700">
                    {isSearching ? 'Finding drivers nearby...' : 'Search cancelled'}
                  </span>
                  <span className="text-lg font-medium text-gray-500">
                    {searchProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    className="bg-blue-600 h-4 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${searchProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Pickup Location */}
              <div className="flex items-center mb-6 p-4 bg-blue-50 rounded-lg">
                <FaMapMarkerAlt className="text-blue-600 text-2xl mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Meet at pickup for</p>
                  <p className="text-xl font-semibold text-gray-800">{pickup}</p>
                </div>
              </div>

              {/* Driver Matching Animation */}
              {isSearching && (
                <div className="flex flex-col items-center ">
                  <div className="relative w-32 h-32 m-10 pt-100">
                    {/* Pulsing circle animation */}
                    <motion.div
                      className="absolute inset-0 bg-blue-100 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Car icon in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={service === 'Ambulance' ? "/images/ambulance.jpg" : "/images/air_ambulance.jpg"} 
                        alt="Vehicle" 
                        className="w-32 h-32 rounded-full"
                      />
                    </div>
                  </div>
                  <p className="text-gray-600 text-center">
                    Matching you with the nearest available {service.toLowerCase()}
                  </p>
                </div>
              )}

              {/* Options Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="flex items-center justify-center w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FaEllipsisH className="text-gray-600 text-xl" />
                </button>

                {showOptions && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                    <button
                      onClick={cancelSearch}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-red-50 text-red-600"
                    >
                      <FaTimes className="mr-3" />
                      Cancel driver search
                    </button>
                    <button
                      onClick={confirmDetails}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <FaCheck className="mr-3 text-green-600" />
                      Confirm details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Time */}
            {isSearching && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-600">
                  Estimated arrival: <span className="font-semibold">5-10 minutes</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};