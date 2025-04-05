import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Analytics } from "../components/Analytics";
import LocationAutocomplete from "../components/LocationAutocomplete";
import CityAutocomplete from "../components/CityAutocomplete";
import { useAuth } from "../store/auth"; // Import the auth context


export const Home = () => {
  // Get location state and updater function from auth context

  const { locationState, setLocationState, isLoggedIn } = useAuth();
  const { pickup, dropoffCity, dropoffHospital, latlong_pickup, latlong_drop } = locationState;
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const errorRef = useRef(null);

  // Clear error when locations are updated
  useEffect(() => {
    if (pickup && (dropoffCity && dropoffHospital)) {
      setError("");
    }
  }, [pickup, dropoffCity, dropoffHospital]);

  // Handle clicks outside the error message
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (error && errorRef.current && !errorRef.current.contains(event.target)) {
        setError("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [error]);



  //whenever pickup and dropoffhospital changes , update the latlong_pickup and latlong_drop.

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const fetchlatlong = async (address) => {
      console.log('Fetching latlong for:', address);
      if (!address || typeof address !== 'string') return null;

      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        // console.log('API Request:', url);

        const response = await fetch(url);
        const data = await response.json();
        console.log('API Response:', data);

        // if (data.status === 'ZERO_RESULTS') {
        //   console.warn('No results found for:', address);
        //   return null;
        // }
        if (data.results && data.results.length > 0) {
          const latlong = data.results[0].geometry.location;
          return latlong; // Return the latlong object
        } else {
          setError('Unable to fetch latlong');
        }
      } catch (error) {
        setError('Unable to fetch latlong');
        console.error('Unable to fetch latlong', error);
      }
    }
    // Fetch and update pickup coords
    const updatePickup = async () => {
      if (!pickup) return;
      const coords = await fetchlatlong(pickup.description || pickup);
      setLocationState(prev => ({
        ...prev,
        latlong_pickup: coords || { latitude: null, longitude: null },
      }));
    };

    // Fetch and update dropoff coords
    const updateDropoff = async () => {
      if (!dropoffHospital) return;
      const coords = await fetchlatlong(dropoffHospital);
      setLocationState(prev => ({
        ...prev,
        latlong_drop: coords || { latitude: null, longitude: null },
      }));
    };

    updatePickup();
    updateDropoff();
    console.log(latlong_drop, latlong_pickup);

  }, [pickup, dropoffHospital]);


  // Handle location selection (from auto-detect) and object (from suggestions)
  const handleLocationSelect = (location) => {
    const locationObj = typeof location === 'string'
      ? { description: location, place_id: Date.now().toString() }
      : location;
    // Update context state
    setLocationState(prev => ({
      ...prev,
      pickup: locationObj
    }));
  }
  // handle city selection
  const handlecityselect = (city) => {
    const cityObj = typeof city === 'string'
      ? { description: city, place_id: Date.now().toString() }
      : city;
    //update context state
    setLocationState(prev => ({
      ...prev,
      dropoffCity: cityObj
    }));
  }

  // Handle when a hospital suggestion is selected
  const handleHospitalSelect = (hospital) => {
    setHospitals([])
    const hospitalObj = { hospital };
    onSelect(hospitalObj);
    // Update context state
    setLocationState(prev => ({
      ...prev,
      dropoffHospital: hospital
    }));
  };

  // Handle navigation to See Prices page
  const handleSeePrices = () => {
    //token validation
    // console.log(authorizationToken);
    // console.log("hi");
    if (!isLoggedIn) {
      navigate('/register');
      return;
    }
    // Validate inputs
    if (!pickup) {
      setError("Please enter pickup location");
      return;
    }
    if (!dropoffCity && !dropoffHospital) {
      setError("Please enter either dropoff city or hospital");
      return;
    }

    // Navigate to SeePrices with location data
    navigate('/home/seeprices', {
      state: {
        pickup: pickup.description || pickup,
        drop: dropoffHospital
      }
    });
  };

  // fetch hospitals by  city from backend / databases.

  const [loading, setLoading] = useState(false);
  // Function to fetch hospitals by city

  const [hospitals, setHospitals] = useState([]);

  // Function to fetch hospitals by city
  const fetchHospitalsByCity = async () => {

    try {
      const response = await fetch(`http://localhost:5000/api/hospital/fetchHostitalInfo?city=${dropoffCity}`);

      setLoading(true); // Set loading state to true
      // First check if the response is OK (status 200-299)
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      const data = await response.json();


      setHospitals(data);
      console.log("Received data:", data); // Log the actual response data
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false); // Set loading state to false after fetching
    }
  };


  //Handle when a city suggestion is selected
  const handleSuggestionClick = (hospital) => {
    setHospitals([])
    const hospitalobj = { hospital };
    onSelect(hospitalobj);
    // Update context state
    setLocationState(prev => ({
      ...prev,
      dropoffHospital: hospital
    }));
  };

  const hospitalsDropdownRef = useRef(null);

  // Add this useEffect hook near your other useEffect hooks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hospitalsDropdownRef.current && !hospitalsDropdownRef.current.contains(event.target)) {
        setHospitals([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <>
      <main>
        <section className="section-hero bg-white text-black">
          <div className="container grid grid-two-cols">
            <div className="hero-content">
              <p>We are World's first Personalized Ambulance booking website</p>
              <h1>Revolutionize Your Ambulance Experience</h1>
              <p>
                Seamlessly book and track your ambulance with our real-time location services.
              </p>
              <div className="btn btn-group">
                <div className="mx-auto p-6 space-y-6">
                  {/* Error message display */}
                  {error && (
                    <div
                      ref={errorRef}
                      className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded cursor-pointer transition-all duration-200 hover:bg-red-200"
                      onClick={() => setError("")}
                    >
                      <p className="font-bold text-lg">Error</p>
                      <p className="text-md">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col justify-center gap-10">
                    {/* Pickup Location Input */}
                    <div className="flex flex-row gap-7 items-center">
                      <div className="bg-green-500 rounded-full w-5 h-5"></div>
                      <div className="flex flex-row justify-between w-full items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                        <LocationAutocomplete
                          className="w-full h-20 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          onSelect={handleLocationSelect}
                          value={pickup?.description || ""}
                        />
                      </div>
                    </div>

                    {/* Dropoff City Input */}
                    <div className="flex flex-row items-center gap-7 justify-between">
                      <CityAutocomplete className="w-full h-20 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onSelect={handlecityselect}
                        value={dropoffCity?.description || ""}
                      />

                      {/* <button className="text-white" type="button" onClick={fetchHospitalsByCity}>Search Hospitals</button> */}
                      <button className="text-white" type="button" onClick={fetchHospitalsByCity}>Search Hospitals</button>
                    </div>


                    {/* Dropoff Hospital Input - Modified structure */}
                    <div className="relative flex w-full flex-row gap-7 items-center space-x-3">
                      <div className="bg-red-500 rounded-full w-5 h-5"></div>
                      <div className="relative w-full" ref={hospitalsDropdownRef}>
                        <input
                          type="text"
                          placeholder="Dropoff Hospital"
                          className="w-full h-20 border bg-gray-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={dropoffHospital}
                          onChange={(e) => setLocationState(prev => ({
                            ...prev,
                            dropoffHospital: e.target.value
                          }))}
                        />
                        {loading && (
                          <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                            <div className="p-2 text-gray-500">Loading Hospitals...</div>
                          </div>
                        )}
                        {!loading && hospitals.length > 0 && (
                          <ul className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col w-full">
                            {hospitals.map((hospital, index) => (
                              <li
                                key={index}
                                onClick={() => {
                                  setLocationState(prev => ({
                                    ...prev,
                                    dropoffHospital: hospital.commonName
                                  }));
                                  setHospitals([]);
                                }}
                                className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                              >
                                {hospital.commonName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>


                    {/* See Prices Button */}
                    <button
                      className="text-white btn w-full pl-12 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 py-4 rounded-lg font-medium"
                      onClick={handleSeePrices}
                      type="button"
                    >
                      See Prices
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <img className="h-500 w-700" src="src/assets/docter.svg" alt="Fastest Ambulance" />
            </div>
          </div>
        </section>
      </main>

      <Analytics />

      <section className="section-hero">
        <div className="container grid grid-two-cols bg-white text-black">
          <div className="hero-image">
            <img className="h-500 w-700" src="src/assets/docter2.svg" alt="Fastest Ambulance" />
          </div>

          <div className="hero-content">
            <p>We are here to help you</p>
            <h1>Book your first Ambulance</h1>
            <p>
              Experience the convenience of our cutting-edge ambulance booking app.
              Seamlessly request, track, and manage your rides at your fingertips.
            </p>
            <div className="btn btn-group">
              <a href="/contact">
                <button className="btn text-white">Connect Now</button>
              </a>
              <a href="/services">
                <button className="btn secondary-btn">Learn More</button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};