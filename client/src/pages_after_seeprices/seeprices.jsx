import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaAmbulance, FaPlane, FaUserFriends } from 'react-icons/fa';
import { useAuth } from "../store/auth"; // Import the auth context

export const Seeprices = () => {
  const location = useLocation();
  const { locationState } = useAuth(); // Get location state from context
  const navigate = useNavigate();

  const mapRef = useRef(null); // Ref for the map container
  // State for map initialization
  const [map, setMap] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scriptRef = useRef(null); // Ref for the Google Maps script

  // Priority: Use location.state if available (direct navigation), otherwise use context
  const { pickup: routePickup, drop: routeDrop } = location.state || {};
  const { pickup: contextPickup, dropoffCity, dropoffHospital, latlong_drop, latlong_pickup } = locationState;

  // Determine final pickup and drop values
  const pickup = routePickup || contextPickup || 'Unknown Location';
  const drop = dropoffHospital || 'Unknown Destination';

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  //   ******   Problem to say to interviewer: docs doesnt has examples to integrate google maps with react. its a strategic task to use the standard documentation and integrate it with react.  Notice deviations from the standard documentation. because the React implementation differs strategically.


  // ****** Strategic Discussion Points to say to interviewer:(resarch and say)
  // When asked about differences, structure your answer as:

  // Acknowledge Standard Approach
  // "The documentation suggests this basic implementation..."  // READ THE  DOCS (HIGHLY IMPORTANT : https://developers.google.com/maps/documentation/javascript/overview)

  // Identify React-Specific Challenges
  // "But in React we face three unique problems:
  // a) Lifecycle management
  // b) Strict mode behaviors
  // c) HMR rehydration"

  // Show Solution Evolution
  // "This led me to implement a three-phase loading process:
  // Phase 1: Script injection with ref tracking
  // Phase 2: Callback state synchronization
  // Phase 3: Cleanup guards"

  // Reference Community Patterns
  // "The React wrapper library (@react-google-maps/api) actually uses similar techniques, as seen in their source..."

  // Initialize map when component mounts

  useEffect(() => {
    // Check if script is already loaded
    if (window.google) {   // When the Google Maps JavaScript API loads successfully, it attaches its main object to window.google.
      setScriptLoaded(true);
      return;
    }

    // Create script element
    scriptRef.current = document.createElement('script');
    scriptRef.current.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    scriptRef.current.async = true;
    scriptRef.current.defer = true;

    // Define the global callback
    window.initMap = () => setScriptLoaded(true); // State management

    document.head.appendChild(scriptRef.current);

    return () => {
      // Cleanup function
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
      }
      delete window.initMap;
    };
  }, []);

  // Initialize map when script loads : https://developers.google.com/maps/documentation/javascript/reference/map#Map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 25.5941, lng: 85.1376 },
      zoom: 15,
      mapTypeId: "roadmap"
    });
    newMap.setTilt(45);
    directionsRenderer.setMap(newMap);

    calculateAndDisplayRoute(directionsService, directionsRenderer);


    return () => {
      // Additional cleanup if needed
    };
  }, [scriptLoaded]);


/////showing the route on the map

   function calculateAndDisplayRoute(directionsService, directionsRenderer) {

    directionsService
      .route({
        origin: {
          query: pickup
        },
        destination: {
          query: dropoffHospital
        },
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);


      })
      .catch((e) => window.alert("Directions request failed due to " + status));
  }


  const [service, setService] = useState("Ambulance");

  // Available ambulance services data
  const services = [
    {
      type: 'Ambulance',
      src: "/images/ambulance.jpg",
      capacity: '3 (1-Patient , 2-Family Member)',
      time: '5 mins away',
      description: 'Affordable and compact rides',
      price: 2000,
    },
    {
      type: 'Air Ambulance',
      src: "/images/air_ambulance.jpg",
      capacity: '4 (1-Patient , 3-Family Member)',
      time: '15 mins away',
      description: 'Fast and reliable air transport',
      price: 10000,
    },
  ];

  // Handle service selection
  const handleServiceClick = (serviceType) => {
    console.log(`Selected service: ${serviceType}`);
    setService(serviceType);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Full-width container */}
      <div className="container mx-auto p-8">
        {/* Flex container for map and services */}
        <div className="w-full flex flex-col lg:flex-row  gap-8 justify-between">
          {/* Map Section (Left Side) */}
          <div className="">
            {/* Map container - replaces the image */}
            <div
              ref={mapRef}
              className="w-5xl h-[500px] rounded-lg"
              style={{ backgroundColor: '#e5e7eb' }}
            >
              {!scriptLoaded && <div className="flex items-center justify-center h-full">Loading map...</div>}
            </div>
            {/* Display pickup and drop locations */}
            <div className="mt-4 p-4 bg-white text-black rounded-lg shadow">
              <p className="font-semibold">Pickup: <span className="font-normal">{pickup}</span></p>
              <p className="font-semibold">Dropoff: <span className="font-normal">{drop}</span></p>
            </div>
          </div>

          {/* Service Options Section (Right Side) */}
          <div className="lg:w-1/2 flex flex-col gap-8 w-full">
            <div className="text-5xl font-bold p-10 text-gray-800 self-center">Gathering options</div>

            {/* Services List */}
            <div className="space-y-6">
              {services.map((serviceItem, index) => (
                <button
                  key={index}
                  className={`flex items-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 w-full text-left ${service === serviceItem.type ? 'border-2 border-black' : 'border border-transparent'
                    }`}
                  style={{
                    backgroundColor: 'white',
                    transition: 'border-color 0.3s ease',
                  }}
                  onClick={() => handleServiceClick(serviceItem.type)}
                >
                  {/* Service Image */}
                  <img
                    src={serviceItem.src}
                    alt={`${serviceItem.type} service`}
                    className='w-65  '
                  />

                  {/* Service Details */}
                  <div className="flex flex-col gap-3 w-full ml-6">
                    <div className='name_price w-full flex flex-row justify-between'>
                      <div className="text-3xl font-bold text-gray-800">{serviceItem.type}</div>
                      <div className="amount flex flex-row items-center">
                        <img src="/src/assets/rupee.svg" alt="rupee" className='h-6' />
                        <div className="text-2xl font-bold text-black ml-1">{serviceItem.price}</div>
                      </div>
                    </div>

                    <div className='flex flex-row items-center'>
                      <img src="/src/assets/person.svg" alt="Capacity" className='h-6' />
                      <div className="text-lg text-black ml-2">{serviceItem.capacity}</div>
                    </div>

                    <div className="text-gray-600">{serviceItem.time}</div>
                    <div className="text-gray-500 italic">{serviceItem.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Choose Service Button */}
            <button
              onClick={() => navigate('/seeprices/chooseservice', {
                state: {
                  service,
                  pickup, // Using the determined pickup value
                  drop    // Using the determined drop value
                }
              })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
            >
              Choose {service}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};