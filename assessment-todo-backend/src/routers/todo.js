import express from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { v4 as uuidv4 } from "uuid";
import { validateTodo, validateUser } from "../schemas/validators.js";
import auth from "../middleware/auth.js";
import { verifyToken } from "../functions/cookies.js";

dayjs.extend(utc);
const router = express.Router();

export default ({ todoRepository }) => {
  // Create new todo
  router.post("/", auth, async (req, res) => {
    try {
      let session = verifyToken(req.cookies["todox-session"]);

      const todoID = uuidv4();
      const created = dayjs().utc().toISOString();

      let newTodo = {
        ...req.body,
        todoID,
        userID: session.userID,
        completed: false,
        created,
      };

      if (validateTodo(newTodo)) {
        let resultTodo = await todoRepository.insertOne(newTodo);
        return res.status(201).send(resultTodo);
      }
      console.error(validateTodo.errors);
      return res.status(400).send({ error: "Invalid field used." });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Todo creation failed." });
    }
  });

  // get all user todos
  router.get("/", auth, async (req, res) => {
    try {
      const session = verifyToken(req.cookies["todox-session"]);
      const resultTodos = await todoRepository.getAllByUserId(session.userID);
      return res.status(200).send(resultTodos);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Todo fetch failed." });
    }
  });

  // toggle todo completed
  router.put("/completed", auth, async (req, res) => {
    try {
      const session = verifyToken(req.cookies["todox-session"]);
      const { todoID, completed } = req.body;

      if (!todoID || completed === undefined) {
        return res.status(400).send({ error: "invalid req body" });
      }

      try {
        const updatedTodo = await todoRepository.updateCompletedStatus(
          session.userID,
          todoID,
          !completed
        );
		if (!updatedTodo) {
			return res.status(500).send({ error: "failed to update" });
		}
        return res.status(200).send(updatedTodo);
      } catch (error) {
        return res.status(400).send({ error });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "something went wrong" });
    }
  });

  return router;
};
