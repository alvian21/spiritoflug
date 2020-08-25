const environment = require('./app.json').env;

require('env2')('.env.' + environment);
const fs = require("fs");
const socketio = require('socket.io');
const express = require("express");
const router = express.Router();
const path = require("path");
const async = require("async");
const upload = require("express-fileupload");
const bodyParser = require("body-parser");
const http = require('http');
const output = require("./functions/output");
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const io =  socketio(server);

const uri = process.env.MONGO_HOST;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });

const connection = mongoose.connection;

connection.once('open', () => {
  console.log("Mongodb database connection established successfully");
});

app.use(upload());
app.use(express.static(__dirname));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json({ limit: process.env.JSON_LIMIT }));
app.use(bodyParser.urlencoded({ extended: true }));



fs.readdir("./routes", (err, files) => {
  var len = files.length;
  var lenX = len - 1;
  var n = 0;
 
  files.map(route => {
    if (route.match(".js")) {
      app.use("/" + route.replace(".js", ""), require("./routes/" + route));
      // const chatroute = route.replace(".js", "");
      // if(chatroute == "chat"){
      //   console.log(require("./routes/chat.js"));
      // }
      if (n === lenX) {
        app.use((req, res, next) => {
          return output.print(req, res, {
            code: "SERVICE_NOT_FOUND"
          });
        });

        server.listen(process.env.PORT, () => {
          return console.log(
            process.env.SERVICE_NAME + " start on port " + process.env.PORT
          );
        });
      }
    }

    n++;
  });
});



app.locals.io = io