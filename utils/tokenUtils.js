const axios = require('axios');
const TokenModel = require('../model/token');

const SHIPROCKET_LOGIN_URL = 'https://apiv2.shiprocket.in/v1/external/auth/login';
const SHIPROCKET_CREDENTIALS = {
    email: "vaibhavrathorema@gmail.com",
    password: "Param@28"
};

// Function to fetch new token from ShipRocket API
const fetchNewToken = async () => {
    try {
        const response = await axios.post(SHIPROCKET_LOGIN_URL, SHIPROCKET_CREDENTIALS, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.token) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 9); // Set expiration to 9 days from now
            
            return {
                token: response.data.token,
                expiresAt: expiresAt
            };
        }
        throw new Error('Failed to get token from ShipRocket API');
    } catch (error) {
        console.error('Error fetching new token:', error.message);
        throw error;
    }
};

// Function to delete all existing tokens
const deleteAllTokens = async () => {
    try {
        await TokenModel.deleteMany({});
        console.log('All existing tokens deleted successfully');
    } catch (error) {
        console.error('Error deleting tokens:', error.message);
        throw error;
    }
};

// Function to check and update token if expired or about to expire
const checkAndUpdateToken = async () => {  
    try {
        // Get the latest token from database
        const latestToken = await TokenModel.findOne().sort({ createdAt: -1 });
        
        // Log current token status
        if (latestToken) {
            console.log('Current token exists');
            console.log('Token expires at:', latestToken.expiresAt);
        } else {
            console.log('No token found in database. Fetching new token...');
        }
 
        const now = new Date();
        const refreshThreshold = new Date();
        refreshThreshold.setDate(now.getDate() + 1); // Refresh if token expires within 1 day
        
        if (!latestToken || (latestToken.expiresAt && latestToken.expiresAt <= now)) {
            console.log('Token expired or not found. Deleting old tokens and fetching new token...');
            
            // Delete all existing tokens first
            await deleteAllTokens();
            
            // Fetch and save new token
            const newTokenData = await fetchNewToken();
            
            // Create new token record
            const newToken = await TokenModel.create({
                token: newTokenData.token,
                expiresAt: newTokenData.expiresAt
            });
            
            console.log('New token created successfully');
            console.log('New token expires at:', newToken.expiresAt);
            return newToken;
        } else if (latestToken.expiresAt <= refreshThreshold) {
            console.log('Token will expire soon (within 1 day). Refreshing token...');
            
            // Delete all existing tokens first
            await deleteAllTokens();
            
            // Fetch and save new token
            const newTokenData = await fetchNewToken();
            
            // Create new token record
            const newToken = await TokenModel.create({
                token: newTokenData.token,
                expiresAt: newTokenData.expiresAt
            });
            
            console.log('Token refreshed successfully');
            console.log('New token expires at:', newToken.expiresAt);
            return newToken;
        }

        console.log('Token is still valid. No refresh needed.');
        return latestToken;
    } catch (error) {
        console.error('Error in token refresh process:', error.message);
        throw error;
    }
};

module.exports = {
    fetchNewToken,
    checkAndUpdateToken,
    deleteAllTokens
};