// const app = require("./app");
// const dotenv = require("dotenv");
// const database = require("./config/database");
// const { checkAndUpdateToken } = require("./utils/tokenUtils");

// // Load environment variables
// dotenv.config();

// // Load database
// database();

// const initializeServer = async () => {
//     try {
//         // Check and update token before starting server
//         const token = await checkAndUpdateToken();
        
//         if (token) { 
//             console.log('Server starting with token:', token.token);
//         } else {
//             console.log('Server starting - no token available');
//         } 

//         // Start server
//         app.listen(process.env.PORT, () => {
//             console.log(`Server started on port ${process.env.PORT}`);
//         });
//     } catch (error) {
//         console.error('Failed to initialize server:', error);
//         process.exit(1); // Exit with error
//     }
// };

// initializeServer();



const app = require("./app");
const dotenv = require("dotenv");
const database = require("./config/database");

// Load environment variables
dotenv.config();

// Connect database
database();

// Normalize port
const PORT = process.env.PORT || 5009;

// ===============================
// SAFE SERVER INITIALIZATION
// ===============================
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
  }
};

// Start server WITHOUT blocking dependencies
startServer();

// ===============================
// GRACEFUL ERROR HANDLING
// ===============================
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
