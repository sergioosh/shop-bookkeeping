import { useEffect, useMemo, useRef, useState } from "react";
import type { Sale, Period } from "../types";
import { buckets, cost, keyOf, money, rev } from "../utils";

export function Chart({ sales }: { sales: Sale[] }) {
  const [p, setP] = useState<Period>("day");
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 320, h: 220 });
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.max(200, e.contentRect.width), h: Math.max(140, e.contentRect.height) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const data = useMemo(() => {
    const b = buckets(p).map((x) => ({ ...x, sales: 0, profit: 0 }));
    sales.forEach((s) => { const k = keyOf(new Date(s.date), p), row = b.find((x) => x.key === k); if (row) { row.sales += rev(s); row.profit += rev(s) - cost(s); } });
    return b;
  }, [sales, p]);
  const { w: W, h: H0 } = size, H = H0 - 24, bw = W / data.length, max = Math.max(1, ...data.map((d) => d.sales)), skip = bw < 38 ? 2 : 1;
  return (
    <div className="card chartcard">
      <div className="row between wrap">
        <h3>Performance</h3>
        <div className="tabs">{(["day", "week", "month", "year"] as Period[]).map((x) => <button key={x} className={p === x ? "on" : ""} onClick={() => setP(x)}>{x === "day" ? "Daily" : x === "week" ? "Weekly" : x === "month" ? "Monthly" : "Yearly"}</button>)}</div>
      </div>
      <div className="chartwrap" ref={wrap}>
        <svg viewBox={`0 0 ${W} ${H0}`} role="img" aria-label="Sales and profit chart">
          {[0, 0.5, 1].map((t) => <line key={t} x1="0" x2={W} y1={H - t * (H - 8)} y2={H - t * (H - 8)} stroke="var(--line)" />)}
          {data.map((d, i) => {
            const h1 = (d.sales / max) * (H - 8), h2 = (Math.max(0, d.profit) / max) * (H - 8);
            return (
              <g key={d.key}>
                <rect x={i * bw + bw * 0.12} y={H - h1} width={bw * 0.36} height={h1} rx="3" fill="#6a795d"><title>{`${d.label}: sales ${money(d.sales)}`}</title></rect>
                <rect x={i * bw + bw * 0.52} y={H - h2} width={bw * 0.36} height={h2} rx="3" fill="#D9D28b"><title>{`${d.label}: profit ${money(d.profit)}`}</title></rect>
                {i % skip === 0 && <text x={i * bw + bw / 2} y={H + 16} textAnchor="middle" fontSize="11" fill="var(--mute)">{d.label}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="legend"><span><i style={{ background: "#6a795d" }} />Sales</span><span><i style={{ background: "#D9D28b" }} />Profit</span></div>
    </div>
  );
}
