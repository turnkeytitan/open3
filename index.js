require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Book = require("./book");
const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());

function format(tokens, req, res) {
  const body =
    tokens.method(req, res) === "POST" ? JSON.stringify(req.body) : "";
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    body,
  ].join(" ");
}
app.use(morgan(format));

app.get("/api/persons", (request, response, next) => {
  Book.find({})
    .then((contacts) => response.json(contacts))
    .catch(next);
});

app.get("/api/persons/:id", async (request, response, next) => {
  try {
    const person = await Book.findById(request.params.id);
    response.json(person);
  } catch (error) {
    next(error);
  }
});

app.get("/info", (request, response, next) => {
  let date = new Date(Date.now());
  Book.find({})
    .then((contacts) => {
      response.send(
        `<p>Phonebook has info for ${contacts.length} people</p><p>${date}</p>`,
      );
    })
    .catch(next);
});

app.delete("/api/persons/:id", (request, response, next) => {
  console.log(request.params.id);
  try {
    Book.findByIdAndDelete(request.params.id)
      .then((result) => {
        console.log(result);
        response.status(204).end();
      })
      .catch(next);
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", async (request, response, next) => {
  const { name, num } = request.body;
  const contact = new Book({ name, num });
  const existing = await Book.find({ name });
  if (existing) {
    await contact
      .save()
      .then((result) => response.status(204).json(result))
      .catch(next);
  } else {
    response.status(403).json();
  }
});

app.put("/api/persons/:id", async (request, response, next) => {
  try {
    const { id, ...rest } = request.body;
    const found = await Book.findByIdAndUpdate(id, rest, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (found) {
      response.status(204).end();
    } else {
      response.status(410).end("No such contact found");
    }
  } catch (error) {
    next(error);
  }
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ message: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ message: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
