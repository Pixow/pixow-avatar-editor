const fs = require("fs");
const path = require("path");
const fsa = require("fs-extra");

const manifest = require("./manifest.json");

const dest = path.join(
  path.join("C://Users//moJiXiang//AppData//Roaming//Pixowor//plugins", `${manifest.pid}`)
);

fs.rmdir(dest, { recursive: true }, (err) => {
  if (err) {
    console.error("rmdir error: ", err);
  }

  fsa.copy(path.join(__dirname, "dist"), dest, (err) => {
    if (err) {
      console.error("copy error: ", err);
    }
  });
});
