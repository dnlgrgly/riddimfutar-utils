// this script fetches all BKK stops
// and matches the stop IDs with the name of the available sound files
// inside the storage bucket

const axios = require("axios");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const main = async () => {
  // fetch data from BKK API
  const { data } = await axios.get(
    "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/stops-for-location.json?key=riddimfutar-utils"
  );

  // drop useless data
  const stops = data.data.list.map((stopRaw) => {
    return { name: stopRaw.name, id: stopRaw.id };
  });

  console.log(stops);
};

main();

mongoose.connection.close();
