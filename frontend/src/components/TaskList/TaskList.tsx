import { useCallback, useEffect, useRef, useState } from "react";
import type { Task } from "../../types";
import TaskItem from "../TaskItem/TaskItem";
import styles from "./TaskList.module.css";

// Show 1 card on mobile, 3 on desktop
const getVisible = () => (window.innerWidth < 500 ? 1 : 3);

type Props = {
  tasks: Task[];
  loading: boolean;
  error: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
};

export default function TaskList({
  tasks,
  loading,
  error,
  onToggle,
  onDelete,
  onEdit,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(getVisible);

  // Only activate the infinite carousel when we have more tasks than visible slots
  const useCarousel = tasks.length > visible;

  // The "origin" is the start index of the middle copy in the tripled array.
  // it resets to this position after normalization so we never run out of slides.
  const origin = tasks.length;
  const [index, setIndex] = useState(origin);
  const [locked, setLocked] = useState(false);

  // Infinite loop technique: triple the array so we have [copy1, copy2, copy3]. (I tripled down just to be safe against fast clicks initially)
  // The user sees copy2 (the middle). When they scroll past its edges,
  // we silently jump back to the equivalent position in copy2.
  const slides = useCarousel ? [...tasks, ...tasks, ...tasks] : tasks;

  // Calculate slide width in pixels to avoid sub-pixel rounding issues that cause visible jumps with percentage-based transforms.
  //(Had an issue where cards would jump left by 10-20 pixel at the end of the track due to rounding)
  const slideWidth = () => (wrapperRef.current?.offsetWidth ?? 0) / visible;

  // Move the track to a given slide index, optionally with animation
  const moveTo = (i: number, animate: boolean) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = animate
      ? "transform 0.5s ease"
      : "none";
    trackRef.current.style.transform = `translateX(-${i * slideWidth()}px)`;
  };

  // Advance by one slide in the given direction. Locked flag prevents rapid clicks from breaking the animation mid-transition.
  const slide = useCallback(
    (dir: 1 | -1) => {
      if (locked || !useCarousel) return;
      setLocked(true);
      const next = index + dir;
      setIndex(next);
      moveTo(next, true);
    },
     // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, index, useCarousel],
  );

  // When the task list changes, reset position to the origin (middle copy)
  useEffect(() => {
    setIndex(origin);
    setLocked(false);
    requestAnimationFrame(() => moveTo(origin, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, origin]);

  // Recalculate position and visible count on window resize
  useEffect(() => {
    const onResize = () => {
      setVisible(getVisible());
      moveTo(index, false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // After each slide animation ends, normalize the index back to the middle copy.
  // This creates the illusion of infinite scrolling - the user never reaches the edge.
  const onSlideEnd = (e: React.TransitionEvent) => {
    // Ignore transition events bubbling up from child elements (e.g. card hover)
    if (e.target !== trackRef.current) return;

    // Calculate the equivalent position within the middle copy
    const offset =
      (((index - origin) % tasks.length) + tasks.length) % tasks.length;
    const norm = origin + offset;

    if (norm !== index) {
      // Jump instantly (no animation) to the normalized position
      moveTo(norm, false);
      // Force a reflow so the browser applies the jump before React re-renders
      void trackRef.current!.getBoundingClientRect();
      setIndex(norm);
    }
    setLocked(false);
  };

  if (loading)
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        <p>Loading tasks...</p>
        <div style={{ height: 20 }}></div>
      </div>
    );

  if (error)
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        <p className={styles.errorText}>{error}</p>
        <div style={{ height: 20 }}></div>
      </div>
    );

  if (!tasks.length)
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        <p>No tasks available</p>
        <div style={{ height: 20 }}></div>
      </div>
    );

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {useCarousel ? (
        <>
          <div
            ref={trackRef}
            className={styles.track}
            onTransitionEnd={onSlideEnd}
          >
            {slides.map((task, i) => (
              <div
                key={i}
                className={styles.slide}
                style={{ width: `${100 / visible}%` }}
              >
                <TaskItem
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </div>
            ))}
          </div>
          <div className={styles.buttons}>
            <button onClick={() => slide(-1)}>Prev</button>
            <button onClick={() => slide(1)}>Next</button>
          </div>
        </>
      ) : (
        <div className={styles.staticList}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
      <div style={{ height: 20 }}></div>
    </div>
  );
}
