export type Task = {
id: number,
title: string,
description: string,
completed: boolean,
createdAt: Date,
priority: 'low' | 'medium' | 'high'
}

export type CreateTaskBody = Pick<Task, 'title' | 'description' | 'priority'>; //user should only give these 3 fields when creating

export type TaskParams = { id: string };
export type UpdateTaskBody = Omit<Task, 'id' | 'createdAt'>;  //we don't need these fields when updating
export type UpdateTaskResponse = { message: string; task?: Task };
export type AddTaskResponse = { message: string; task?: Task };