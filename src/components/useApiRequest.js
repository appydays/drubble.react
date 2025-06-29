import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Helper function to extract the XSRF-TOKEN from browser cookies.
// Laravel's CSRF protection for SPAs requires this token to be sent
// in the X-XSRF-TOKEN header for non-GET requests.
const getXsrfTokenFromCookie = () => {
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';'); // Split all cookies
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        // Trim leading spaces
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        // If this cookie string begins with the name we want
        if (c.indexOf(name) === 0) {
            // Return the token part (URL decoded)
            return c.substring(name.length, c.length);
        }
    }
    return ''; // Return empty string if token not found
};

/**
 * Custom React Hook for making authenticated API requests to a Laravel backend
 * using Sanctum's SPA authentication (cookie-based).
 *
 * It automatically handles:
 * - Fetching the CSRF cookie (/sanctum/csrf-cookie) for non-GET requests.
 * - Including the X-XSRF-TOKEN header for CSRF protection.
 * - Sending and receiving cookies (credentials: 'include').
 * - Setting Accept: application/json and Content-Type: application/json headers.
 * - Basic loading, error, and data states.
 *
 * @param {string} baseUrl The base URL of your Laravel API (e.g., 'https://your-laravel-backend.cymru/api').
 * @returns {object} An object containing:
 * - data: The response data from the API call.
 * - loading: Boolean indicating if a request is in progress.
 * - error: Any error message from the request.
 * - makeRequest: A function to trigger an API call.
 */
const useApiRequest = (baseUrl) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const { i18n } = useTranslation();

    // useCallback memoizes the makeRequest function to prevent unnecessary re-renders
    // and ensures stable function identity across component renders.
    const makeRequest = useCallback(async (url, method = 'GET', body = null) => {
        setLoading(true);
        setError(null);
        setData(null); // Clear previous data before a new request

        try {

            // Prepare request headers
            const headers = {
                'Accept': 'application/json', // Always expect JSON response from API
                'Accept-Language': i18n.language,
            };

            // Step 2: For non-GET/HEAD requests, manually add the X-XSRF-TOKEN header.
            // Axios does this automatically, but with fetch, we need to do it ourselves.
            if (method !== 'HEAD') {
                const xsrfToken = getXsrfTokenFromCookie();
                if (xsrfToken) {
                    headers['X-XSRF-TOKEN'] = xsrfToken;
                } else {
                    // Log a warning if the token is not found, as CSRF protection will likely fail.
                    console.warn('XSRF-TOKEN not found in cookies. CSRF protection might fail for this request.');
                    // Depending on your application's security requirements, you might
                    // choose to throw an error here or prevent the request.
                }
                headers['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;
            }

            // If a request body is provided, set the Content-Type header
            if (body) {
                headers['Content-Type'] = 'application/json';
            }

            // Prepare fetch options
            const options = {
                method: method,
                headers: headers,
                credentials: 'include', // Crucial: Send cookies (laravel_session, XSRF-TOKEN) with the request
            };

            // Attach the request body if present
            if (body) {
                options.body = JSON.stringify(body);
            }

            // Make the actual API request
            const response = await fetch(`${baseUrl}${url}`, options);

            // Handle HTTP error responses (e.g., 401, 403, 404, 500)
            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    // Attempt to parse error message from JSON response body
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                // Throw an error to be caught by the calling component
                throw new Error(errorMessage);
            }

            // Parse the successful JSON response data
            const responseData = await response.json();
            setData(responseData); // Update the state with the response data
            return responseData;   // Return data for immediate use by the caller

        } catch (err) {
            setError(err.message); // Set the error state
            console.error('API Request Error:', err); // Log the error for debugging
            throw err; // Re-throw the error to allow the component using the hook to handle it
        } finally {
            setLoading(false); // Always set loading to false when the request completes
        }
    }, [baseUrl, i18n.language]); // Dependency array: makeRequest will only re-create if baseUrl changes

    // Return the states and the request function
    return { data, loading, error, makeRequest };
};

export default useApiRequest;

