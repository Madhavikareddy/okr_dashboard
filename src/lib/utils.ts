import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEPARTMENTS = ["IT", "Finance", "Marketing", "Sales", "HR"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export function currentQuarter(d: Date = new Date()) {
  return Math.ceil((d.getMonth() + 1) / 3);
}
