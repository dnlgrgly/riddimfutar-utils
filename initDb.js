// this script fetches all BKK stops
// and matches the stop IDs with the name of the available sound files
// inside the storage bucket

const axios = require("axios");
const mongoose = require("mongoose");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage();

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

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

const main = async () => {
  // fetch list of available file names
  const [files] = await storage.bucket("futar").getFiles();

  files.sort();

  // fetch data from BKK API
  const bkkRaw = await axios.get(
    "https://futar.bkk.hu/api/query/v1/ws/otp/api/where/stops-for-location.json?key=riddimfutar-utils"
  );

  // drop useless data
  const stops = bkkRaw.data.data.list
    .map((stopRaw) => {
      return { name: stopRaw.name, id: stopRaw.id };
    })
    // stops with a non-F(UTAR) or CS(oport)F(UTAR) code are usually
    // underpass entraces and administrative stops
    // -- we don't need them
    .filter((stop) => stop.id.includes("BKK_F") || stop.id.includes("BKK_CSF"));

  stops.sort();

  let unusedFilenames = [...files];
  let unusedStops = [...stops];
  let results = [];

  for (let i = 0; i < stops.length; i++) {
    const { name, id } = stops[i];
    let stopName = normalise(name);

    const fileIndex = files.findIndex((file) =>
      MHMH(file.name).includes(stopName)
    );

    if (fileIndex > 0) {
      results.push({ name, id, fileName: files[fileIndex].name });
      //   console.log(`✅ ${name} - ${files[fileIndex].name}`);
      const unusedFileIndex = unusedFilenames.indexOf(files[fileIndex]);
      if (unusedFileIndex > -1) {
        unusedFilenames.splice(unusedFileIndex, 1);
      }
      const unusedStopIndex = unusedStops.indexOf(stops[i]);
      if (unusedStopIndex > -1) {
        unusedStops.splice(unusedStopIndex, 1);
      }
    }
  }

  // post-match results
  console.log(`✅ Matches: ${results.length}`);

  if (unusedFilenames.length > 0) {
    console.log("⚠️ Unmatched files ⚠️");
    console.log(`${unusedFilenames.length} not used (out of ${files.length})`);
    // unusedFilenames.forEach((file) => console.log(`❌ ${file.name}`));
  }

  if (unusedStops.length > 0) {
    console.log("⚠️ Unmatched stop names ⚠️");
    console.log(`${unusedStops.length} not used (out of ${stops.length})`);
    // unusedStops.forEach((stop) => console.log(`❌ ${stop.name}`));
  }
};

main();

mongoose.connection.close();
