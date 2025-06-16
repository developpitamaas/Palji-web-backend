const app = require("./app");
const dotenv = require("dotenv");
const database = require("./config/database");
const { checkAndUpdateToken } = require("./utils/tokenUtils");


// Load environment variables
dotenv.config();

// Load database
database();

const initializeServer = async () => {
    try {
        // Check and update token before starting server
        const token = await checkAndUpdateToken();
        
        if (token) { 
            console.log('Server starting with token:', token.token);
        } else {
            console.log('Server starting - no token available');
        } 

        // Start server
        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1); // Exit with error
    }
};

initializeServer();


// Start server
app.listen(5000, () => {
    console.log(`Server started on port ${process.env.PORT}`);
})