var express = require("express");
var app = express();
const cors = require('cors');
const indexRouter = require("./api/index");

const signupRouter = require("./api/signup"); // Import the signup routes
const maintenanceRouter = require('./api/maintenance'); //import maintenance router
const scheduleRouter = require("./api/schedule"); // Import the scheduleRouter


app.set("port", process.env.PORT || 3000);

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.static("src"));
app.use(cors());
app.use("/api", indexRouter);

app.use("/api", signupRouter); // Use the signup routes
app.use("/api", maintenanceRouter); //use the maintenance router
app.use("/api", scheduleRouter); // Use the scheduleRouter


app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});
