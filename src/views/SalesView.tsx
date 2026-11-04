import { useEffect, useMemo, useRef, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import type { Product, Line, Sale } from "../types";
import { cost, exportCsv, money, num, rev, uid } from "../utils";

export function SalesView({ products, sales, setSales }: { products: Product[]; sales: Sale[]; setSales: Dispatch<SetStateAction<Sale[]>> }) {
  const [cart, setCart] = useState<Line[]>([]);
  const [q, setQ] = useState(""), [msg, setMsg] = useState("");
  const box = useRef<HTMLInputElement>(null);
  const focus = () => box.current?.focus();
  useEffect(focus, []);

  // "3 sugar" or "3x sugar" -> quantity 3, search "sugar"
  const find = (t: string) => products.filter((p) => p.name.toLowerCase().includes(t.toLowerCase())).sort((a, b) => Number(b.name.toLowerCase().startsWith(t.toLowerCase())) - Number(a.name.toLowerCase().startsWith(t.toLowerCase())));
  const m = q.trim().match(/^(\d+)\s*(?:[x×*]\s*|\s)(.+)$/);
  let qty = m ? Number(m[1]) : 1, matches = q.trim() ? find(m ? m[2] : q.trim()) : [];
  if (!matches.length && m) { matches = find(q.trim()); qty = 1; }
  matches = matches.slice(0, 6);

  const popular = useMemo(() => {
    const c = new Map<string, number>();
    sales.forEach((s) => s.lines.forEach((l) => c.set(l.pid, (c.get(l.pid) ?? 0) + l.qty)));
    return [...products].sort((a, b) => (c.get(b.id) ?? 0) - (c.get(a.id) ?? 0)).slice(0, 8);
  }, [products, sales]);

  const addProduct = (p: Product, n = 1) => {
    setCart((c) => (c.some((l) => l.pid === p.id) ? c.map((l) => (l.pid === p.id ? { ...l, qty: l.qty + n } : l)) : [...c, { pid: p.id, name: p.name, qty: n, buy: p.buy, sell: p.sell }]));
    setQ(""); setMsg(""); focus();
  };
  const upd = (i: number, patch: Partial<Line>) => setCart((c) => c.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const step = (i: number, d: number) => setCart((c) => c.flatMap((l, j) => (j !== i ? [l] : l.qty + d > 0 ? [{ ...l, qty: l.qty + d }] : [])));
  const repeat = () => { const last = sales[sales.length - 1]; if (last) { setCart(last.lines.map((l) => { const p = products.find((x) => x.id === l.pid); return { ...l, buy: p?.buy ?? l.buy, sell: p?.sell ?? l.sell }; })); focus(); } };
  const save = () => {
    if (!cart.length) return;
    setSales((s) => [...s, { id: uid(), date: new Date().toISOString(), lines: cart }]);
    setMsg(`Sale saved · ${money(total)}`); setCart([]); setQ(""); focus();
    setTimeout(() => setMsg(""), 3000);
  };
  const total = cart.reduce((a, l) => a + l.qty * l.sell, 0), profit = total - cart.reduce((a, l) => a + l.qty * l.buy, 0);
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (matches.length) addProduct(matches[0], qty);
    else if (!q.trim()) save();
  };

  return (
    <>
      <div className="row gap wrap">
        <button className="btn" onClick={() => { setCart([]); setQ(""); setMsg(""); focus(); }}>Enter new sale</button>
        <button className="btn ghost" onClick={repeat} disabled={!sales.length}>Repeat last sale</button>
        <button className="btn accent" onClick={save} disabled={!cart.length}>Save sale</button>
        {msg && <span className="pill ok" role="status">✓ {msg}</span>}
      </div>

      <div className="card">
        <input ref={box} className="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Type a product, or quantity + product, e.g. 3 sugar" aria-label="Find product" />
        {matches.length > 0 && (
          <div className="matches">
            {matches.map((p, i) => <button key={p.id} className={i === 0 ? "first" : ""} onClick={() => addProduct(p, qty)}>{qty > 1 ? `${qty} × ` : ""}{p.name}<span>{money(p.sell)}</span></button>)}
          </div>
        )}
        {q.trim() && !matches.length && <p className="muted">No product matches “{q}”. Add it in the Products tab.</p>}
        {!products.length && <p className="muted">Add products in the Products tab before recording a sale.</p>}
        {popular.length > 0 && (
          <div className="tiles">{popular.map((p) => <button key={p.id} onClick={() => addProduct(p)}><b>{p.name}</b><span>{money(p.sell)}</span></button>)}</div>
        )}
        <p className="muted hint">Press Enter to add the top match. Press Enter on an empty box to save the sale.</p>
      </div>

      <div className="card">
        {!cart.length ? <p className="muted">Nothing in this sale yet. Tap a product above or start typing.</p> : (
          <>
            {cart.map((l, i) => (
              <div className="line" key={l.pid}>
                <span className="nm">{l.name}</span>
                <div className="stepper"><button onClick={() => step(i, -1)} aria-label={`Less ${l.name}`}>−</button><input type="number" min={1} value={l.qty} onChange={(e) => upd(i, { qty: num(e.target.value) })} aria-label="Quantity" /><button onClick={() => step(i, 1)} aria-label={`More ${l.name}`}>+</button></div>
                <label className="price"><input type="number" value={l.sell} onChange={(e) => upd(i, { sell: num(e.target.value) })} aria-label="Price sold at" /><small>each</small></label>
                <strong className="lt">{money(l.qty * l.sell)}</strong>
                <button className="link" onClick={() => setCart((c) => c.filter((_, j) => j !== i))} aria-label={`Remove ${l.name}`}>✕</button>
              </div>
            ))}
            <div className="row between totalbar">
              <div><span className="muted">Total</span><div className="big2">{money(total)}</div><span className="muted">Profit {money(profit)}</span></div>
              <button className="btn accent huge" onClick={save}>Save sale</button>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="row between"><h3>Sales sheet</h3><button className="btn ghost" onClick={() => exportCsv(sales)} disabled={!sales.length}>Export CSV</button></div>
        {!sales.length ? <p className="muted">No sales saved yet.</p> : (
          <table>
            <thead><tr><th>Date</th><th>Items</th><th className="r">Revenue</th><th className="r">Profit</th><th /></tr></thead>
            <tbody>{[...sales].reverse().slice(0, 50).map((s) => <tr key={s.id}><td>{new Date(s.date).toLocaleString()}</td><td>{s.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</td><td className="r">{money(rev(s))}</td><td className="r">{money(rev(s) - cost(s))}</td><td><button className="link" onClick={() => setSales((x) => x.filter((y) => y.id !== s.id))}>Delete</button></td></tr>)}</tbody>
          </table>
        )}
        {sales.length > 50 && <p className="muted">Showing the latest 50. Export CSV for the full sheet.</p>}
      </div>
    </>
  );
}
