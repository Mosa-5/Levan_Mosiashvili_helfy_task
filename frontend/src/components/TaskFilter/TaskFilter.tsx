import styles from "./TaskFilter.module.css";

type Filter = "all" | "completed" | "pending";

type Props = {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
};

export default function TaskFilter({ currentFilter, onFilterChange }: Props) {
  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
  ];

  return (
    <div className={styles.tabs}>
      {filters.map((f) => (
        <span
          key={f.value}
          className={`${styles.tab} ${currentFilter === f.value ? styles.active : ""}`}
          onClick={() => onFilterChange(f.value)}
        >
          {f.label}
        </span>
      ))}
    </div>
  );
}
