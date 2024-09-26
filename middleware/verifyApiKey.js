

const axios = require('axios'); 
const validApiKeys = [
    { key: process.env.API_KEY_1, id: 'API_Key1' },
    { key: process.env.API_KEY_2, id: 'API_Key2' },
    { key: process.env.API_KEY_3, id: 'API_Key3' },
    { key: process.env.API_KEY_4, id: 'API_Key4' },
    { key: process.env.API_KEY_5, id: 'API_Key5' },
];

const loggingApiKey = process.env.API_KEY_LOGGING


const verifyApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
 
    // Check if the API key is defined
    if (!apiKey) {
        console.error('No API key provided');
        return res.status(403).json({ message: 'Forbidden: No API Key Provided' });
    }

    // Check if the API key is the special logging key
    if (apiKey === loggingApiKey) {
        return next(); 
    }

    // Find the matching API key and its corresponding document ID
    const validKey = validApiKeys.find(item => item.key === apiKey);

    // If the API key is not valid, return 403 Forbidden
    if (!validKey) {
        console.error('Invalid API key'); 
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }

    // Get the corresponding Firestore document ID
    const apiLogId = validKey.id;
  
    try {
        // Send a POST request to increment the count for the correct API key log
        await axios.post(`https://campus-infrastructure-management.azurewebsites.net/api/APILogs/${apiLogId}`, {
            count: 1 // Increment count by 1
        }, {
            headers: { 'x-api-key': loggingApiKey } 
        });
     
    } catch (error) {
        console.error('Error updating API log:', error.message);
        return res.status(500).send('Error updating API log'); 
    }

    next(); 
};

module.exports =verifyApiKey;