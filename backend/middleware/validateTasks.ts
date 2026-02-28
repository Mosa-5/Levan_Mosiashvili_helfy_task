import { Request, Response, NextFunction } from "express";
import { CreateTaskBody } from "../types";

export const validateTask = (
  req: Request<{}, {}, CreateTaskBody>,
  res: Response,
  next: NextFunction,
) => {
  const { title, description, priority } = req.body;

  //simple check for null or undefined
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  //small length checks, I don't want to allow super long titles or descriptions
  if (title.length > 25) {
    return res
      .status(400)
      .json({ message: `Title must not exceed 25 characters` });
  }

  if (description.length > 200) {
    return res
      .status(400)
      .json({ message: `Description must not exceed 200 characters` });
  }

  //checking valid priority
  if (!["low", "medium", "high"].includes(priority)) {
    return res
      .status(400)
      .json({ message: "Priority must be low, medium, or high" });
  }

  next();
};
