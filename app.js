// app.js
require('dotenv').config();
var express = require("express");
var app = express();
const cors = require('cors');
const indexRouter = require("./api/index");
const signupRouter = require("./api/signup"); // Import the signup routes

app.set("port", process.env.PORT || 3000);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static("src"));
app.use(cors());
app.use("/api", indexRouter);
app.use("/api", signupRouter); // Use the signup routes

app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});
