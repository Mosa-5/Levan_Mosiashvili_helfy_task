import { useEffect, useRef, useState } from "react";
import type { Task } from "./types";
import { getTasks, createTask, updateTask, deleteTask, toggleTask } from "./services/api";
import TaskForm from "./components/TaskForm/TaskForm";
import TaskFilter from "./components/TaskFilter/TaskFilter";
import TaskList from "./components/TaskList/TaskList";
import "./App.css";

type Filter = "all" | "completed" | "pending";
type Sort = "" | "date_asc" | "date_desc" | "title_asc" | "title_desc";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filterRef = useRef(filter);
  const searchRef = useRef(search);
  const sortRef = useRef(sort);
  filterRef.current = filter;
  searchRef.current = search;
  sortRef.current = sort;

  const fetchTasks = (
    f = filterRef.current,
    s = searchRef.current,
    so = sortRef.current,
  ) => {
    setLoading(true);
    setError("");

    getTasks(f, s, so)
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch tasks");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = (body: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
  }) => {
    createTask(body)
      .then(() => fetchTasks())
      .catch((err) => setError(err.message));
  };

  const handleUpdateTask = (body: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    completed?: boolean;
  }) => {
    if (!editingTask) return;

    updateTask(editingTask.id, body)
      .then(() => {
        setEditingTask(null);
        fetchTasks();
      })
      .catch((err) => setError(err.message));
  };

  const handleDeleteTask = (id: number) => {
    deleteTask(id)
      .then(() => fetchTasks())
      .catch((err) => setError(err.message));
  };

  const handleToggle = (id: number) => {
    toggleTask(id)
      .then(() => fetchTasks())
      .catch((err) => setError(err.message));
  };

  const handleSubmit = (body: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    completed?: boolean;
  }) => {
    if (editingTask) handleUpdateTask(body);
    else handleAddTask(body);
  };

  return (
    <div className="app">
      <h1>Task Manager</h1>

      <TaskForm
        key={editingTask?.id ?? "new"}
        onSubmit={handleSubmit}
        editingTask={editingTask}
        onCancel={() => setEditingTask(null)}
      />

      <div className="controls">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchTasks(filter, e.target.value, sort);
          }}
        />

        <select
          value={sort}
          onChange={(e) => {
            const v = e.target.value as Sort;
            setSort(v);
            fetchTasks(filter, search, v);
          }}
        >
          <option value="">No sorting</option>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="title_asc">Title A-Z</option>
          <option value="title_desc">Title Z-A</option>
        </select>
      </div>

      <TaskFilter
        currentFilter={filter}
        onFilterChange={(f: Filter) => {
          setFilter(f);
          fetchTasks(f, search, sort);
        }}
      />

      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onToggle={handleToggle}
        onDelete={handleDeleteTask}
        onEdit={setEditingTask}
      />
    </div>
  );
}

export default App;
