// This file is used as CONTEXT API such that we do not need to pass the props again and again in every in between components

import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext(); //step-1--> creating context first


export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token")); //getting the token stored in the local storage and storing/initializing in the token variable
    const [user, setUser] = useState("");
    const [services, setServices] = useState([]);
    const authorizationToken = `Bearer ${token}`;//token from the local storage that we have earlier stored
    const [isLoading, setIsLoading] = useState(true);// such that while setting the user data is loading is applied so that we can block the path of admin page

    //!for final hosting
    const API = import.meta.env.VITE_APP_URI_API;// for the hosting purpose

    const [locationState, setLocationState] = useState({
        pickup: null,
        dropoffCity: "",
        dropoffHospital: "",
        pickupid: null,
        dropoffHospitalid: null,
        latlong_pickup: { latitude: null, longitude: null },    //latitude and longitude of the pickup location
        latlong_drop: { latitude: null, longitude: null },    //latitude and longitude of the dropoff  hospital.
    });
    // NEW: Clear location state
    const clearLocationState = () => {
        setLocationState({
            pickup: null,
            dropoffCity: "",
            dropoffHospital: "",
            pickupid: null,
            dropoffHospitalid: null,
            latlong_pickup: { latitude: null, longitude: null },    //latitude and longitude of the pickup location
            latlong_drop: { latitude: null, longitude: null },    //latitude and longitude of the dropoff  hospital.
        });
    };


    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        return localStorage.setItem('token', serverToken);
    };

    let isLoggedIn = !!token;//! means if there is token present then it's value will become true and flase otherwise
    console.log("isLoggedIn ", isLoggedIn);

    //tackling the logout functionality
    const LogoutUser = () => {
        setToken(""); // after logout the token will be set to empty in token variable use state
        return localStorage.removeItem("token"); //also we will remove the token from the local storage
    }

    //JWT AUTHENTICATION --> to get the currently logged in data--> to display the name
    const userAuthentication = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API}/api/auth/user`,
                {
                    method: "GET",
                    headers: {
                        Authorization: authorizationToken,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log("user data", data.userData);
                // console.log("user token", data.token);
                // console.log(user);
                setUser(data.userData);
                setIsLoading(false);//such that admin path will be bloked for non admin user
            } else {
                console.error("Error fetching user data");
                setIsLoading(false);
            }
        } catch (error) {
            console.log("error fetching the data", error);
        }
    }

    //to fetch the data of services from the database
    const getServices = async () => {
        try {
            const response = await fetch(`${API}/api/data/service`, {
                method: "GET",
            });

            if (response.ok) {
                const data = await response.json();
                //! we have the data in the form of json and now we need the data in the form of object to destructure it
                console.log(data.message);
                setServices(data.message);
                // console.log(services);
            }
        } catch (error) {
            console.log(`services frontend error ${error}`);
        }
    }

    useEffect(() => {//only one time run
        getServices();// to get the services in the service page
        userAuthentication();
    }, []);

    return (
        //step 2--> creating the provider
        <AuthContext.Provider value={{
            isLoggedIn, storeTokenInLS, LogoutUser, user, services, authorizationToken, isLoading, API,
            locationState,
            setLocationState,
            clearLocationState
        }} >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => { //custome hook
    const authContextValue = useContext(AuthContext); //iske andar sara data hai //also consumer //step 3---> will be used where needed
    if (!authContextValue) {
        throw new Error("useAuth used outside of the Provider");
    }
    return authContextValue;
}

