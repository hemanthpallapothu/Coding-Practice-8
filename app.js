const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initilizeDBAndStart = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Database Error : ${error}`);
  }
};
initilizeDBAndStart();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

// API 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `SELECT 
          * 
          FROM 
          todo 
          WHERE 
          todo LIKE '%${search_q}%' 
          AND priority='${priority}'
          AND status='${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `SELECT 
          * 
          FROM 
          todo 
          WHERE  
          todo LIKE '%${search_q}%' 
          AND priority='${priority}';`;
      break;
    default:
      getTodosQuery = `SELECT 
          * 
          FROM 
          todo 
          WHERE  
          todo LIKE '%${search_q}%' 
          AND status='${status}';`;
      break;
  }
      data = await db.all(getTodosQuery);
      response.send(data);
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodoQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const data = await db.get(getSpecificTodoQuery);
  response.send(data);
});

// API 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuerey = `INSERT INTO todo (id, todo, priority, status)
  Values (
      '${id}',
      '${todo}',
      '${priority}',
      '${status}'
  );`;
  await db.run(addTodoQuerey);
  response.send("Todo Successfully Added");
});

let hasTodoProperties = (updateDetails) => {
  return (
    updateDetails.todo !== undefined &&
    updateDetails.status === undefined &&
    updateDetails.priority === undefined
  );
};

let hasStatusProperties = (updateDetails) => {
  return (
    updateDetails.todo === undefined &&
    updateDetails.status !== undefined &&
    updateDetails.priority === undefined
  );
};

let hasPriorityProperties = (updateDetails) => {
  return (
    updateDetails.todo === undefined &&
    updateDetails.status === undefined &&
    updateDetails.priority !== undefined
  );
};

// API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateDetails = request.body;
  const { todo, status, priority } = updateDetails;

  switch (true) {
    case hasTodoProperties(updateDetails):
      updateDetails = `UPDATE todo 
          SET todo='${todo}' WHERE id='${todoId}'`;
      await db.run(updateDetails);
      response.send("Todo Updated");
      break;
    case hasStatusProperties(updateDetails):
      updateDetails = `UPDATE todo 
          SET status='${status}' WHERE id='${todoId}'`;
      await db.run(updateDetails);
      response.send("Status Updated");
      break;
    default:
      updateDetails = `UPDATE todo 
          SET priority='${priority}' WHERE id='${todoId}'`;
      await db.run(updateDetails);
      response.send("Priority Updated");
      break;
  }
});

// API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id='${todoId}';`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
