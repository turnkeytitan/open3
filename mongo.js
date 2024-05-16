const mongoose = require("mongoose");
const arg = process.argv;
const len = process.argv.length;
if (len < 3) {
  console.log("give password as an argument");
  process.exit(1);
}
const password = process.argv[2];

const url = `mongodb+srv://samuelsanchez:${password}@cluster0.c7lm6xl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

if (len > 3 && len !== 5) {
  console.log("name and phone needed");
  process.exit(1);
}

mongoose.connect(url);

const phonebook = mongoose.connection.useDb("phonebook");

const contactSchema = new mongoose.Schema({
  name: String,
  num: String,
});

const Contact = phonebook.model("Contact", contactSchema);
if (len === 5) {
  const contact = new Contact({
    name: arg[3],
    num: arg[4],
  });

  contact.save().then((result) => {
    console.log(`added ${arg[3]} number ${arg[4]} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Contact.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((note, i) => {
      console.log(note.name, note.number);
    });
    mongoose.connection.close();
  });
}
