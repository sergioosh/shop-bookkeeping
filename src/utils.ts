import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Product, Sale, Period } from "./types";

export const CUR = "UGX"; // change to your currency code
export const uid = () => Math.random().toString(36).slice(2, 10);
export const money = (n: number) => `${Math.round(n).toLocaleString()} ${CUR}`;
export const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monday = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
export const keyOf = (d: Date, p: Period) =>
  p === "day" ? dayKey(d) : p === "week" ? dayKey(monday(d)) : p === "month" ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}` : `${d.getFullYear()}`;
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const buckets = (p: Period) => {
  const now = new Date(), n = p === "day" ? 14 : p === "week" ? 12 : p === "month" ? 12 : 5, out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    if (p === "day") d.setDate(d.getDate() - i);
    if (p === "week") d.setDate(d.getDate() - 7 * i);
    if (p === "month") { d.setDate(1); d.setMonth(d.getMonth() - i); }
    if (p === "year") d.setFullYear(d.getFullYear() - i);
    const m = p === "week" ? monday(d) : d;
    out.push({ key: keyOf(d, p), label: p === "month" ? MONTHS[d.getMonth()] : p === "year" ? `${d.getFullYear()}` : `${m.getDate()}/${m.getMonth() + 1}` });
  }
  return out;
};
export const rev = (s: Sale) => s.lines.reduce((a, l) => a + l.qty * l.sell, 0);
export const cost = (s: Sale) => s.lines.reduce((a, l) => a + l.qty * l.buy, 0);
export const num = (v: string) => Number(v) || 0;

export function useStore<T>(key: string, init: T): [T, Dispatch<SetStateAction<T>>] {
  const [v, setV] = useState<T>(() => { try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ } }, [key, v]);
  return [v, setV];
}

export function exportCsv(sales: Sale[]) {
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [["Date", "Sale ID", "Product", "Qty", "Buy price", "Sell price", "Revenue", "Cost", "Profit"]];
  sales.forEach((s) => s.lines.forEach((l) => rows.push([s.date, s.id, l.name, l.qty, l.buy, l.sell, l.qty * l.sell, l.qty * l.buy, l.qty * (l.sell - l.buy)].map(String))));
  const blob = new Blob([rows.map((r) => r.map(q).join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `sales-${dayKey(new Date())}.csv`; a.click(); URL.revokeObjectURL(a.href);
}
