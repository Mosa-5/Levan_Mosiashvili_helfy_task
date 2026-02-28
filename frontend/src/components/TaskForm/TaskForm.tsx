import { useState } from "react";
import type { Task } from "../../types";
import styles from "./TaskForm.module.css";

type Props = {
  onSubmit: (body: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    completed?: boolean;
  }) => void;
  editingTask: Task | null;
  onCancel: () => void;
};

export default function TaskForm({ onSubmit, editingTask, onCancel }: Props) {
  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [description, setDescription] = useState(
    editingTask?.description ?? "",
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    editingTask?.priority ?? "medium",
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (title.length > 25) {
      setError("Title must not exceed 25 characters");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (description.length > 200) {
      setError("Description must not exceed 200 characters");
      return;
    }

    if (editingTask) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        completed: editingTask.completed,
      });
    } else {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
      });
    }

    setTitle("");
    setDescription("");
    setPriority("medium");
    setError("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{editingTask ? "Edit Task" : "Add Task"}</h2>
      <div className={styles.errorContainer}>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={25}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={200}
      />

      <select
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as "low" | "medium" | "high")
        }
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <div className={styles.buttons}>
        <button type="submit">
          {editingTask ? "Update Task" : "Add Task"}
        </button>
        {editingTask && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
