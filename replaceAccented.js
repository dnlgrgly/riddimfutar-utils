const fs = require("fs");
const list = fs.readdirSync("dataSrc/mp3");

list.forEach(async (item) => {
  const fileName = item;
  const res = fileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  fs.rename(`dataSrc/mp3/${fileName}`, `dataSrc/mp3/${res}`, function (err) {
    if (err) console.log(`❌ ${fileName}`);
  });
});
