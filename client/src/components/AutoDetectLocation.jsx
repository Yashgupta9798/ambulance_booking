 



// ******** ALSO READ the docs. *******

import React, { useState } from 'react';
import { useAuth } from "../store/auth"; // Import the auth context


const AutoDetectLocation = ({ onLocationDetected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle auto-detection of location
  const handleAutoDetect = () => {
    setIsLoading(true);
    setError('');

    // The Geolocation API is not "fetched" like an external API (e.g., the Geocoding API). 
    // Instead, it is a built-in browser API that is directly available in modern browsers 
    // through the navigator.geolocation object. This is why we didn't use fetch or make an 
    // HTTP request to use the Geolocation API

    if (navigator.geolocation) {  // if geolocation is supported by the browser
      // Request user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude);
        },
        (error) => {   // Supported by browser and error in getting location
          setIsLoading(false);
          setError('Unable to retrieve your location. Please enter it manually.');
          console.error('Error getting location:', error);
        }
      );
    } 
    else { //if geolocation is not supported by the browser
      setIsLoading(false);
      setError('Geolocation is not supported by your browser. Please enter your location manually.');
    }
  };

  // Function to convert coordinates to a readable address
  const reverseGeocode = async (latitude, longitude) => {
    const apiKey = import.meta.env.GO_MAPS_API_KEY;// Replace with your API key
    // Geocode api: used to convert latitude and longitude coordinates into readable address.
    const apiUrl = `https://maps.gomaps.pro/maps/api/geocode/json?key=${apiKey}&latlng=${latitude},${longitude}`;   

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch address.');
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // formatted_address is the address in human readable format, which is fetched through api.
        const address = data.results[0].formatted_address;
        onLocationDetected(address); // Pass the detected address to the parent component
      } else {
        setError('Unable to retrieve address. Please enter your location manually.');
      }
    } catch (error) {
      setError('Error fetching address. Please enter your location manually.');
      console.error('Error fetching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAutoDetect}
      disabled={isLoading}
      className="hover:opacity-80 transition-opacity"
      aria-label="Auto-detect location"
    >
      {isLoading ? (
        <span>Detecting...</span>
      ) : (
        <img 
          src="/src/assets/autodetect_icon.svg" 
          className="h-12 w-12 pr-2" 
          alt="Auto-detect location icon"
          title="Auto-detect your location"
        />
      )}
    </button>
  );
};

export default AutoDetectLocation;