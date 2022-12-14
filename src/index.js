const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({
      error: "User not found",
    });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({
      error: "User already exists",
    });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    title,
    deadline: new Date(deadline),
    done: false,
    id: uuidv4(),
    created_at: new Date(),
  };

  request.user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found",
    });
  }

  const newTodo = {
    ...todo,
    title: title,
    deadline: new Date(deadline),
  };

  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      return newTodo;
    }
    return todo;
  });

  return response.json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found",
    });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.indexOf(user.todos.find((todo) => todo.id === id));

  console.log(user.todos);

  if (index === -1) {
    return response.status(404).json({
      error: "Todo not found",
    });
  }

  user.todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;
