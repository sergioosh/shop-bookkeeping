import { useMemo, useState } from "react";
import type { Sale, Expense, Period } from "../types";
import { Stat } from "../components/Stat";
import { cost, keyOf, money, rev } from "../utils";

export function ReportsView({ sales, spend }: { sales: Sale[]; spend: Expense[] }) {
  const [r, setR] = useState<Period | "all">("month");
  const now = new Date(), ok = (d: Date) => r === "all" || keyOf(d, r) === keyOf(now, r);
  const ss = sales.filter((s) => ok(new Date(s.date))), ex = spend.filter((e) => ok(new Date(e.date + "T12:00:00")));
  const R = ss.reduce((a, s) => a + rev(s), 0), C = ss.reduce((a, s) => a + cost(s), 0), E = ex.reduce((a, e) => a + e.amount, 0);
  const top = useMemo(() => { const m = new Map<string, { qty: number; profit: number }>(); ss.forEach((s) => s.lines.forEach((l) => { const x = m.get(l.name) ?? { qty: 0, profit: 0 }; m.set(l.name, { qty: x.qty + l.qty, profit: x.profit + l.qty * (l.sell - l.buy) }); })); return [...m.entries()].sort((a, b) => b[1].profit - a[1].profit).slice(0, 5); }, [ss]);
  return (
    <>
      <div className="tabs">{(["day", "week", "month", "year", "all"] as const).map((x) => <button key={x} className={r === x ? "on" : ""} onClick={() => setR(x)}>{x === "day" ? "Today" : x === "week" ? "This week" : x === "month" ? "This month" : x === "year" ? "This year" : "All time"}</button>)}</div>
      <div className="stats">
        <Stat label="Revenue" value={money(R)} badge={`${ss.length} sales`} />
        <Stat label="Cost of goods" value={money(C)} />
        <Stat label="Gross profit" value={money(R - C)} badge={`${R ? (((R - C) / R) * 100).toFixed(1) : "0.0"}% margin`} />
        <Stat label="Spending" value={money(E)} />
        <Stat label="Net profit" value={money(R - C - E)} />
      </div>
      <div className="card"><h3>Top products by profit</h3>{!top.length ? <p className="muted">No sales in this period.</p> : <table><tbody>{top.map(([n, v]) => <tr key={n}><td>{n}</td><td>{v.qty} sold</td><td className="r">{money(v.profit)}</td></tr>)}</tbody></table>}</div>
    </>
  );
}
