import { useState, type Dispatch, type SetStateAction } from "react";
import type { Expense } from "../types";
import { dayKey, money, num, uid } from "../utils";

export function SpendView({ spend, setSpend }: { spend: Expense[]; setSpend: Dispatch<SetStateAction<Expense[]>> }) {
  const [f, setF] = useState({ note: "", category: "Stock", amount: "", date: dayKey(new Date()) });
  const add = () => { if (!f.note.trim() || !num(f.amount)) return; setSpend((s) => [...s, { id: uid(), date: f.date, note: f.note.trim(), category: f.category, amount: num(f.amount) }]); setF({ ...f, note: "", amount: "" }); };
  return (
    <div className="card">
      <h3>Spending</h3>
      <div className="row gap wrap">
        <input placeholder="What was it for?" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Stock", "Rent", "Wages", "Transport", "Utilities", "Other"].map((c) => <option key={c}>{c}</option>)}</select>
        <input type="number" placeholder="Amount" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <button className="btn" onClick={add}>Add expense</button>
      </div>
      {!spend.length ? <p className="muted">No expenses recorded yet.</p> : (
        <table>
          <thead><tr><th>Date</th><th>Note</th><th>Category</th><th className="r">Amount</th><th /></tr></thead>
          <tbody>{[...spend].sort((a, b) => b.date.localeCompare(a.date)).map((s) => <tr key={s.id}><td>{s.date}</td><td>{s.note}</td><td>{s.category}</td><td className="r">{money(s.amount)}</td><td><button className="link" onClick={() => setSpend((x) => x.filter((y) => y.id !== s.id))}>Delete</button></td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
