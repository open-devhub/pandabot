import { randomBytes } from "crypto";

export function generateId(length: number = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}
