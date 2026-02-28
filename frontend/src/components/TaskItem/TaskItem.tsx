import { useState } from "react";
import type { Task } from "../../types";
import styles from "./TaskItem.module.css";

type Props = {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
};

export default function TaskItem({ task, onToggle, onDelete, onEdit }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ""}`}>
      <div className={styles.header}>
        <h2
          className={`${styles.title} ${task.completed ? styles.strike : ""}`}
        >
          {task.title}
        </h2>

        <span className={`${styles.priority} ${styles[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      <p className={styles.description}>{task.description}</p>

      <div className={styles.footer}>
        <span className={styles.date}>
          {new Date(task.createdAt).toLocaleDateString()}
        </span>

        <div className={styles.actions}>
          {confirming ? (
            <>
              <button
                className={styles.delete}
                onClick={() => onDelete(task.id)}
              >
                Yes
              </button>
              <button onClick={() => setConfirming(false)}>No</button>
            </>
          ) : (
            <>
              <button
                className={styles.complete}
                onClick={() => onToggle(task.id)}
              >
                {task.completed ? "Undo" : "Complete"}
              </button>

              <button onClick={() => onEdit(task)}>Edit</button>

              <button
                className={styles.delete}
                onClick={() => setConfirming(true)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
