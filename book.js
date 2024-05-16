const mongoose = require("mongoose");

const url = process.env.MONGO_URL;

mongoose.connect(url);

const phonebook = mongoose.connection.useDb("phonebook");

const contactSchema = new mongoose.Schema({
  name: String,
  num: String,
});

contactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = phonebook.model("Contact", contactSchema);
