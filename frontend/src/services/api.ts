import type { Task } from "../types";

const API_URL = "http://localhost:4000/api/tasks";

type TaskBody = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  completed?: boolean;
};

async function handleResponse(res: Response) {
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message);
  }
  return res;
}

export async function getTasks(
  filter: string,
  search: string,
  sort: string,
): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filter === "completed") params.set("completed", "true");
  else if (filter === "pending") params.set("completed", "false");
  if (search.trim()) params.set("search", search.trim());
  if (sort) params.set("sort", sort);

  const query = params.toString();
  const url = query ? `${API_URL}?${query}` : API_URL;

  const res = await fetch(url);
  return res.json();
}

export async function createTask(body: TaskBody): Promise<Task> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleResponse(res);
  return res.json();
}

export async function updateTask(id: number, body: TaskBody): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleResponse(res);
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  await handleResponse(res);
}

export async function toggleTask(id: number): Promise<Task> {
  const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
  await handleResponse(res);
  return res.json();
}
