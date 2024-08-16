const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3000;

// Apply CORS middleware
app.use(cors({
    origin: 'https://campus-infrastructure-management.azurewebsites.net', // Replace with your frontend URL
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res) => {
  res.send('hello world');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
