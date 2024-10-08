//load enviro variables
require('dotenv').config(); 

var express = require("express");
var app = express();
const cors = require('cors');
const indexRouter = require("./api/index");
const maintenanceRouter = require('./api/maintenance'); //import maintenance router
const scheduleRouter = require("./api/schedule"); // Import the scheduleRouter
const usersRouter = require('./api/users');
const bookingsRouter = require('./api/bookings');
const venuesRouter = require('./api/venues');
const securityRouter = require('./api/security');

const notificationsRouter = require('./api/notification');
const apiLogsRouter = require('./api/apiLogs'); // Import the apiLogsRouter
const menuRouter =require('./api/menu');
//middleware to require a API key
const verifyApiKey = require('./middleware/verifyApiKey');
  

app.set("port", process.env.PORT || 3000);

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.static("src"));
app.use(cors());

//API key verification middleware to /api routes
app.use('/api', verifyApiKey);

app.use("/api", indexRouter);
app.use("/api", maintenanceRouter); //use the maintenance router
app.use("/api", scheduleRouter); // Use the scheduleRouter
app.use("/api", usersRouter);
app.use("/api", bookingsRouter);
app.use("/api", venuesRouter);
app.use("/api", notificationsRouter);
app.use("/api", apiLogsRouter);
app.use("/api", securityRouter);
app.use("/api",menuRouter);


app.set("port", process.env.PORT || 3000);



app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});
