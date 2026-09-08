import path from "path";

export const dbDir = "db";
export const dbPath = path.join(process.cwd(), dbDir);

export const dbkeys = {
  counting: "counting",
  afk: "afk",
};
