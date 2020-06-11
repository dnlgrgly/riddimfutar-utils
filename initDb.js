const axios = require("axios");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

// implement stuff here

mongoose.connection.close();
