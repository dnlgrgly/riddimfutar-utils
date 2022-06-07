// this script fetches all BKK stops
// and matches the stop IDs with the name of the available sound files
// inside the storage bucket

require('dotenv').config()

const axios = require("axios");
const mongoose = require("mongoose");
const { Storage } = require("@google-cloud/storage");

// overwrite renamed stops with obsolote stop name mp3 filenames
const overwrites = require("./dataSrc/mp3config.json");

mongoose.connect(process.env.MONGO_URL, { useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  console.log("mongoose connection is now open!");

  const matchSchema = mongoose.Schema({
    name: String,
    id: String,
    fileName: String,
  });

  const Match = mongoose.model("Match", matchSchema);

  const storage = new Storage();

  let unusedFilenames = [];
  let unusedStops = [];
  let results = [];
  let stops = [];
  let files = [];

  // normalise stop and file names, remove accented characters, etc.
  const normalise = (stopName) => {
    let res = stopName.toLowerCase();
    res = res.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    res = res.replace(/[^a-z0-9]/gi, "");
    return res;
  };

  // metro station, hev station, metro and hev station
  const MHMH = (stopName) => {
    let res = normalise(stopName);
    res = res.replace(/metroeshevallomas/g, "mh");
    res = res.replace(/metroallomas/g, "m");
    res = res.replace(/hevallomas/g, "h");
    return res;
  };

  const match = (i, name, id, fileName, file) => {
    results.push({ name, id, fileName });

    // save data to db
    const match = new Match({
      name,
      id,
      fileName,
    });

    match.save();

    //   console.log(`✅ ${name} - ${files[fileIndex].name}`);

    // update stats
    const unusedFileIndex = unusedFilenames.indexOf(file);
    if (unusedFileIndex > -1) {
      unusedFilenames.splice(unusedFileIndex, 1);
    }
    const unusedStopIndex = unusedStops.indexOf(stops[i]);
    if (unusedStopIndex > -1) {
      unusedStops.splice(unusedStopIndex, 1);
    }
  };

  const printStats = () => {
    console.log(`✅ Matches: ${results.length}`);

    if (unusedFilenames.length > 0) {
      console.log("⚠️ Unmatched files ⚠️");
      console.log(
        `${unusedFilenames.length} not used (out of ${files.length})`
      );
      // unusedFilenames.forEach((file) => console.log(`❌ ${file.name}`));
    }

    if (unusedStops.length > 0) {
      console.log("⚠️ Unmatched stop names ⚠️");
      console.log(`${unusedStops.length} not used (out of ${stops.length})`);
      unusedStops.forEach((stop) => console.log(`❌ ${stop.name}`));
    }
  };

  const main = async () => {
    // fetch list of available file names
    [files] = await storage.bucket("futar").getFiles();

    // fetch data from BKK API
    const bkkRaw = await axios.get(
      "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/stops-for-location.json?key=riddimfutar-utils"
    );

    // drop useless data
    stops = bkkRaw.data.data.list
      .map((stopRaw) => {
        return { name: stopRaw.name, id: stopRaw.id };
      })
      // stops with a non-F(UTAR) or CS(oport)F(UTAR) code are usually
      // underpass entraces and administrative stops
      // -- we don't need them
      .filter(
        (stop) => (stop.id.includes("BKK_F") || stop.id.includes("BKK_CSF")) || stop.type === "SUBURBAN_RAILWAY"
      );

    // filter data
    files.sort();
    stops.sort();

    // reset stats
    unusedFilenames = [...files];
    unusedStops = [...stops];

    // loop over every stop
    for (let i = 0; i < stops.length; i++) {
      const { name, id } = stops[i];

      // if there is an overwrite defined, use that
      if (overwrites[name]) {
        match(i, name, id, overwrites[name], null);
      }

      let stopName = normalise(name);

      // check the index of the file that has the same name as the stop in question
      const fileIndex = files.findIndex((file) => MHMH(file.name) == `${stopName}mp3`);

      // if yes, match the stops
      if (fileIndex > -1) {
        match(i, name, id, files[fileIndex].name, files[fileIndex]);
      }
    }

    // post-matching results
    printStats();
  };

  main();
});
