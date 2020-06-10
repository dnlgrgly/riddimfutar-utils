const gtfs = require("gtfs");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

gtfs
  .import({
    agencies: [
      {
        agency_key: "BKK",
        url: "https://www.bkk.hu/gtfs/budapest_gtfs.zip",
      },
    ],
  })
  .then(() => {
    console.log("Import Successful");
    return mongoose.connection.close();
  })
  .catch((err) => {
    console.error(err);
  });
