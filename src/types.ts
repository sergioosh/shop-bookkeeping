export type Product = { id: string; name: string; buy: number; sell: number };
export type Line = { pid: string; name: string; qty: number; buy: number; sell: number };
export type Sale = { id: string; date: string; lines: Line[] };
export type Expense = { id: string; date: string; note: string; category: string; amount: number };
export type Period = "day" | "week" | "month" | "year";
export type Tab = "dashboard" | "sales" | "products" | "spending" | "reports";
