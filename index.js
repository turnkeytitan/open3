const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static("build"));
app.use(express.json());
function format(tokens, req, res) {
  const body = tokens.method(req, res) === "POST" ? JSON.stringify(req.body) : "";
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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((obj) => obj.id === id);
  if (!person) {
    return response.sendStatus(404);
  }
  response.json(person);
});

app.get("/info", (request, response) => {
  let date = new Date(Date.now());

  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const id = Math.round(Math.random() * 1000000);
  const { name, number } = request.body;
  if (persons.find((person) => person.name === name)) {
    return response.status(400).json({ error: "name must be unique" });
  }
  if (!number) {
    return response.status(422).json({
      error: "number missing",
    });
  }
  const person = {
    id,
    name,
    number,
  };
  persons = persons.concat(person);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
