const speech = require("@google-cloud/speech");
const fs = require("fs");
const client = new speech.SpeechClient();

const list = fs.readdirSync("dataSrc/mp3");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

list.forEach(async (item) => {
  const fileName = item;
  const file = fs.readFileSync(`dataSrc/mp3/${fileName}`);
  const audioBytes = file.toString("base64");

  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: "MP3",
    sampleRateHertz: 16000,
    languageCode: "hu-HU",
  };
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");

  const result = transcription.toLowerCase().split(" ").join("");

  console.log(`✅ ${fileName} - ${result}`);

  fs.rename(`dataSrc/mp3/${fileName}`, `dataSrc/mp3/${result}.mp3`, function (err) {
    if (err) console.log(`❌ ${fileName}`);
  });
});
