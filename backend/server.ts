import { v4 as uuidv4 } from 'uuid';
import express, { Request, Response } from 'express';

const app = express();
const port = 4000;

type Task = {
id: string,
title: string,
description: string,
completed: boolean,
createdAt: Date,
priority: 'low' | 'medium' | 'high'
}

type CreateTaskBody = Omit<Task, 'id' | 'createdAt'>;

type TaskParams = { id: string };
type UpdateTaskBody = Omit<Task, 'id' | 'createdAt'>; //I'll keep this seperate from CreateTaskBody for better readability
type UpdateTaskResponse = { message: string; task?: Task };

const tasks: Task[] = []

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}) 

app.get('/api/tasks', (req: Request, res: Response<Task[]>) => {
    res.json(tasks);
});

app.post('/api/tasks', (req: Request<{}, {}, CreateTaskBody>, res) => {
    const newTask: Task = { ...req.body, id: uuidv4(), createdAt: new Date() };
    tasks.push(newTask);
    res.status(201).json({ message: 'Task created successfully', task: newTask });
});

app.put('/api/tasks/:id', (req: Request<TaskParams, UpdateTaskResponse, UpdateTaskBody>, res: Response<UpdateTaskResponse>) => {
   const id = req.params.id;
   const taskIndex = tasks.findIndex(task => task.id === id);
   
   if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

   const updatedTask: Task = { ...tasks[taskIndex], ...req.body, id };
    
   tasks[taskIndex] = updatedTask;
   
   res.json({ message: 'Task updated successfully', task: updatedTask });
});

app.delete('/api/tasks/:id', (req, res) => {
    const id = req.params.id;
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.json({ message: 'Task deleted', task: deletedTask }); //I'm reterning the deleted task in the response just in case
});

app.patch('/api/tasks/:id/toggle',(req: Request<TaskParams, UpdateTaskResponse>, res: Response<UpdateTaskResponse>) => {
   const id = req.params.id;
   const taskIndex = tasks.findIndex(task => task.id === id);
   
   if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  tasks[taskIndex].completed = !tasks[taskIndex].completed;
  res.json({ message: 'Task completion status toggled', task: tasks[taskIndex] });
});



// GET /api/tasks - Get all tasks
// POST /api/tasks - Create a new task
// PUT /api/tasks/:id - Update a task
// DELETE /api/tasks/:id - Delete a task
// PATCH /api/tasks/:id/toggle - Toggle task completion status