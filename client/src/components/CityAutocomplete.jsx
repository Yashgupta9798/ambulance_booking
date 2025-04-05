//providing city suggestions which are saved in databases or  in which we provide service.

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../store/auth"; // Import the auth context

const CityAutocomplete = ({ onSelect, value }) => {
  // Get location state from context
  const { setLocationState } = useAuth();
  
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  // Debounce function to limit API calls , very important to avoid too many requests to the server.
  // This function will delay the execution of the fetch function until after a specified delay (300ms in this case).
  const debounce = (func, delay) => {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch city suggestions from your backend API
  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/hospital/cities/unique?q=${query}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch city suggestions.");
      }

      const data = await response.json();
      // console.log("City suggestions:", data.data);
      
      setSuggestions(data.data || []);
    } catch (error) {
      // console.error("Error fetching city suggestions:", error);
      setError("Failed to fetch city suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of fetchCitySuggestions
  const debouncedFetchSuggestions = debounce(fetchCitySuggestions, 300);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchSuggestions(value);
  };

  // Handle when a city suggestion is selected
  const handleSuggestionClick = (city) => {
    setQuery(city);
    setSuggestions([]);
    const cityObj = { city };
    onSelect(cityObj);
    // Update context state
    setLocationState(prev => ({
      ...prev,
      dropoffCity: city
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update query when value prop changes
  useEffect(() => {
    if (value) {
      setQuery(value);
    }
  }, [value]);

  return (
    <div className="flex w-full flex-row gap-7 items-center space-x-3 relative" ref={dropdownRef}>
      <div className="bg-blue-400 rounded-full w-5 h-5"></div>
      <div className="w-full relative">
        <input
          type="text"
          placeholder="Enter dropoff city"
          className="w-full h-20 border bg-gray-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 1 && setSuggestions(suggestions)}
        />

        {loading && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-2 text-gray-500">Loading cities...</div>
          </div>
        )}

        {error && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-2 text-red-500">{error}</div>
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <ul className=" absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col w-full">
            {suggestions.map((city, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(city)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              >
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CityAutocomplete;