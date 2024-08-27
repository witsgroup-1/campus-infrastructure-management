require('dotenv').config();


var express = require("express");
var app = express();
const cors = require('cors')
const indexRouter = require("./api/index");

app.set("port", process.env.PORT || 3000);

app.use(express.static("src"));
app.use(cors())
app.use("/api", indexRouter);

app.listen(app.get("port"), function(){
    console.log("Server started on port "+app.get("port"));
});