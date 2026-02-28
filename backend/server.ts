import express from 'express';
import tasksRouter from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';
import cors from 'cors';

const app = express();
const port = 4000;

//I'll allow all origins for now
app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);

// 404 route, I'll have this just in case
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

// centralized error handler, in case I messed up somewhere
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})