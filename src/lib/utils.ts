import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("de-DE").format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(value) + "%";
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * GDPR-conscious IP hashing. We never store raw IPs.
 * The salt rotates daily so hashes cannot be correlated across days,
 * while still allowing basic duplicate-click detection within a day.
 */
export function hashIp(ip: string): string {
  const dailySalt = new Date().toISOString().slice(0, 10);
  return crypto
    .createHash("sha256")
    .update(`${ip}:${dailySalt}:${process.env.IP_HASH_SECRET ?? "velanthor"}`)
    .digest("hex");
}

export function generateReferralCode(firstName: string, lastName: string): string {
  const base = `${firstName}${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base.slice(0, 12)}${suffix}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}
