import PageLayout from "../components/PageLayout";
import styled from "styled-components";
import { Colours, Typography } from "../definitions";
import { useEffect, useState } from "react";
import apiFetch from "../functions/apiFetch";
import InputField from "../components/InputField";

const Todos = () => {
  const [loading, setLoading] = useState(false);
  const [updatingTodo, setUpdatingTodo] = useState(null);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    async function fetchTodos() {
      setLoading(true);
      let response = await apiFetch("/todo", {
        method: "GET",
      });
      const userTodos = response.body;
      // sort todos - latest first
      userTodos.sort((a, b) => {
        return new Date(b.created) - new Date(a.created);
      });
      setTodos(userTodos);
      setLoading(false);
    }

    fetchTodos();
  }, []);

  const toggleTodos = async (event, todo) => {
    event.preventDefault();
    try {
      setUpdatingTodo(todo);
      let response = await apiFetch("/todo/completed", {
        body: { ...todo },
        method: "PUT",
      });

      if (response.status === 200) {
        const updatedArray = [...todos];
        const index = updatedArray.findIndex(
          (item) => item.todoID === response.body.todoID
        );

        if (index !== -1) {
          updatedArray[index] = response.body;
          setTodos(updatedArray);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingTodo(null);
    }
  };

  return (
    <PageLayout title="My Todos">
      <Container>
        <div className="content">
          <h1>My Todos</h1>
          <p>sorted latest todos first</p>
          {loading ? 'loading...' : todos.map((todo) => {
            const formattedDate = formatDate(todo.created);
            return (
              <ul>
                <li className="todo-item">
                  <p>{todo.name}</p>
                  <p>{formattedDate}</p>
                  <InputField
                    className="input"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => toggleTodos(e, todo)}
                    disabled={updatingTodo?._id === todo._id}
                  />
                </li>
              </ul>
            );
          })}
        </div>
      </Container>
    </PageLayout>
  );
};

export default Todos;

const Container = styled.div`
  width: 100%;

  .content {
    h1 {
      color: ${Colours.BLACK};
      font-size: ${Typography.HEADING_SIZES.M};
      font-weight: ${Typography.WEIGHTS.LIGHT};
      line-height: 2.625rem;
      margin-bottom: 2rem;
      margin-top: 1rem;
    }

    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2px;
      border: 1px solid #ccc;
      padding: 10px;
    }
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
};
