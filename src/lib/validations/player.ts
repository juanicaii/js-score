import { z } from "zod";

export const playerNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(30, "El nombre no puede superar los 30 caracteres");
