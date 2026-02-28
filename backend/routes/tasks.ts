import {
  AddTaskResponse,
  CreateTaskBody,
  Task,
  TaskParams,
  UpdateTaskBody,
  UpdateTaskResponse,
} from "../types";
import { Request, Response, Router } from "express";
import { validateTask } from "../middleware/validateTasks";

const router = Router();

const tasks: Task[] = [
  {
    id: 1,
    title: "Setup Express Server",
    description: "Initialize backend with routes and middleware.",
    completed: true,
    createdAt: new Date("2026-02-20"),
    priority: "high",
  },
  {
    id: 2,
    title: "Build Carousel Component",
    description: "Implement infinite scrolling carousel for tasks.",
    completed: false,
    createdAt: new Date("2026-02-22"),
    priority: "high",
  },
  {
    id: 3,
    title: "Add Task Filtering",
    description: "Filter tasks by completed and pending status.",
    completed: false,
    createdAt: new Date("2026-02-24"),
    priority: "medium",
  },
  {
    id: 4,
    title: "Style Task Cards",
    description: "Add priority badges and hover effects.",
    completed: true,
    createdAt: new Date("2026-02-25"),
    priority: "low",
  },
  {
    id: 5,
    title: "Write API Validation",
    description: "Validate title, description and priority fields.",
    completed: false,
    createdAt: new Date("2026-02-27"),
    priority: "medium",
  },
];

let nextId = 6;

// GET /api/tasks - Get all tasks

router.get(
  "/",
  (
    req: Request<
      {},
      {},
      {},
      {
        search?: string;
        sort?: "date_asc" | "date_desc" | "title_asc" | "title_desc";
        completed?: string;
      }
    >,
    res: Response<Task[]>,
  ) => {
    let result = [...tasks];

    const { search, sort, completed } = req.query;

    if (completed === "true") {
      result = result.filter((task) => task.completed);
    } else if (completed === "false") {
      result = result.filter((task) => !task.completed);
    }

    //searching only by title for now
    if (search) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    //I'll sort by date or title, each descending or ascending
    if (sort) {
      if (sort === "date_asc") {
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      } else if (sort === "date_desc") {
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (sort === "title_asc") {
        result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === "title_desc") {
        result.sort((a, b) => b.title.localeCompare(a.title));
      }
    }

    res.json(result);
  },
);

// POST /api/tasks - Create a new task

router.post(
  "/",
  validateTask,
  (req: Request<{}, {}, CreateTaskBody>, res: Response<AddTaskResponse>) => {
    const newTask: Task = {
      ...req.body,
      id: nextId++,
      completed: false,
      createdAt: new Date(),
    };
    tasks.push(newTask);
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  },
);

// PUT /api/tasks/:id - Update a task

router.put(
  "/:id",
  validateTask,
  (
    req: Request<TaskParams, UpdateTaskResponse, UpdateTaskBody>,
    res: Response<UpdateTaskResponse>,
  ) => {
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "Completed must be a boolean" });
    }

    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask: Task = { ...tasks[taskIndex], ...req.body, id };

    tasks[taskIndex] = updatedTask;

    res.json({ message: "Task updated successfully", task: updatedTask });
  },
);

// DELETE /api/tasks/:id - Delete a task

router.delete(
  "/:id",
  (
    req: Request<TaskParams, UpdateTaskResponse>,
    res: Response<UpdateTaskResponse>,
  ) => {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.json({ message: "Task deleted", task: deletedTask }); //I'm reterning the deleted task in the response just in case
  },
);

// PATCH /api/tasks/:id/toggle - Toggle task completion status

router.patch(
  "/:id/toggle",
  (
    req: Request<TaskParams, UpdateTaskResponse>,
    res: Response<UpdateTaskResponse>,
  ) => {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    res.json({
      message: "Task completion status toggled",
      task: tasks[taskIndex],
    });
  },
);

export default router;
