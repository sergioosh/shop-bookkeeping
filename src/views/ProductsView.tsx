import { useState, type Dispatch, type SetStateAction } from "react";
import type { Product } from "../types";
import { money, num, uid } from "../utils";

export function ProductsView({ products, setProducts }: { products: Product[]; setProducts: Dispatch<SetStateAction<Product[]>> }) {
  const [f, setF] = useState({ name: "", buy: "", sell: "" });
  const margin = (p: { buy: number; sell: number }) => (p.sell > 0 ? ((p.sell - p.buy) / p.sell) * 100 : 0);
  const add = () => { if (!f.name.trim()) return; setProducts((p) => [...p, { id: uid(), name: f.name.trim(), buy: num(f.buy), sell: num(f.sell) }]); setF({ name: "", buy: "", sell: "" }); };
  const upd = (id: string, patch: Partial<Product>) => setProducts((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  return (
    <div className="card">
      <h3>Product database</h3>
      <div className="row gap wrap">
        <input placeholder="Product name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input type="number" placeholder="Buying price" value={f.buy} onChange={(e) => setF({ ...f, buy: e.target.value })} />
        <input type="number" placeholder="Selling price" value={f.sell} onChange={(e) => setF({ ...f, sell: e.target.value })} />
        <span className="pill">Margin {margin({ buy: num(f.buy), sell: num(f.sell) }).toFixed(1)}%</span>
        <button className="btn" onClick={add}>Add product</button>
      </div>
      {!products.length ? <p className="muted">No products yet. Add your first one above.</p> : (
        <table>
          <thead><tr><th>Product</th><th>Buying price</th><th>Selling price</th><th className="r">Profit each</th><th className="r">Margin</th><th /></tr></thead>
          <tbody>{products.map((p) => <tr key={p.id}><td>{p.name}</td><td><input type="number" value={p.buy} onChange={(e) => upd(p.id, { buy: num(e.target.value) })} style={{ width: 110 }} /></td><td><input type="number" value={p.sell} onChange={(e) => upd(p.id, { sell: num(e.target.value) })} style={{ width: 110 }} /></td><td className="r">{money(p.sell - p.buy)}</td><td className="r">{margin(p).toFixed(1)}%</td><td><button className="link" onClick={() => setProducts((x) => x.filter((y) => y.id !== p.id))}>Delete</button></td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
