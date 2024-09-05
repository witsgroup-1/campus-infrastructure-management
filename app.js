var express = require("express");
var app = express();
const cors = require('cors');
const indexRouter = require("./api/index");
const maintenanceRouter = require('./api/maintenance'); //import maintenance router
const scheduleRouter = require("./api/schedule"); // Import the scheduleRouter
const usersRouter = require('./api/users');
const bookingsRouter = require('./api/bookings');
const venuesRouter = require('./api/venues');

const notificationsRouter = require('./api/notification');
const bookingsRouter = require("./api/bookings");
const venuesRouter = require("./api/venues");

app.set("port", process.env.PORT || 3000);

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.static("src"));
app.use(cors());
app.use("/api", indexRouter);
app.use("/api", maintenanceRouter); //use the maintenance router
app.use("/api", scheduleRouter); // Use the scheduleRouter
app.use("/api", usersRouter);
app.use("/api", bookingsRouter);
app.use("/api", venuesRouter);
app.use("/api", notificationsRouter);
app.use("/api", bookingsRouter);
app.use("/api", venuesRouter);

app.set("port", process.env.PORT || 3000);



app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});
