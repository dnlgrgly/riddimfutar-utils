const gtfs = require("gtfs");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

gtfs
  .import({
    agencies: [
      {
        agency_key: "BKK",
        url: "https://www.bkk.hu/gtfs/budapest_gtfs.zip",
        exclude: [
          "feed_info",
          "agency",
          "shapes",
          // "routes",
          // "stops",
          "trips",
          "stop_times",
          "calendar_dates",
          "pathways",
        ],
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
