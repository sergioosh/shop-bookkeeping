import { useState } from "react";
import type { Product, Sale, Expense, Tab } from "./types";
import { cost, keyOf, money, rev, useStore } from "./utils";

import { Stat } from "./components/Stat";
import { Chart } from "./components/Chart";
import { SalesView } from "./views/SalesView";
import { ProductsView } from "./views/ProductsView";
import { SpendView } from "./views/SpendView";
import { ReportsView } from "./views/ReportsView";

const NAV: [Tab, string][] = [["dashboard", "Dashboard"], ["sales", "Sales"], ["products", "Products"], ["spending", "Spending"], ["reports", "Profit & reports"]];

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useStore<Product[]>("bk.products", []);
  const [sales, setSales] = useStore<Sale[]>("bk.sales", []);
  const [spend, setSpend] = useStore<Expense[]>("bk.spend", []);
  const [theme, setTheme] = useStore<"light" | "dark">("bk.theme", typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const today = keyOf(new Date(), "day"), month = keyOf(new Date(), "month");
  const tS = sales.filter((s) => keyOf(new Date(s.date), "day") === today), mS = sales.filter((s) => keyOf(new Date(s.date), "month") === month);
  const mSpend = spend.filter((e) => e.date.startsWith(month)).reduce((a, e) => a + e.amount, 0);
  const mProfit = mS.reduce((a, s) => a + rev(s) - cost(s), 0);
  const title = NAV.find((n) => n[0] === tab)![1];

  return (
    <div className="app" data-theme={theme}>
      <aside>
        <div className="brand"><span className="logo">S</span>My Shop</div>
        <nav>{NAV.map(([k, label]) => <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}><i />{label}</button>)}</nav>
        <button className="theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-pressed={theme === "dark"}>{theme === "dark" ? "☀ Light mode" : "☾ Dark mode"}</button>
      </aside>
      <main>
                <h1>{title}</h1>
        {tab === "dashboard" && (
          <div className="dash">
            <div className="stats">
              <Stat label="Today's sales" value={money(tS.reduce((a, s) => a + rev(s), 0))} badge={`${tS.length} sales`} />
              <Stat label="Month sales" value={money(mS.reduce((a, s) => a + rev(s), 0))} />
              <Stat label="Month gross profit" value={money(mProfit)} />
              <Stat label="Month net profit" value={money(mProfit - mSpend)} />
            </div>
            <Chart sales={sales} />
          </div>
        )}
        {tab === "sales" && <SalesView products={products} sales={sales} setSales={setSales} />}
        {tab === "products" && <ProductsView products={products} setProducts={setProducts} />}
        {tab === "spending" && <SpendView spend={spend} setSpend={setSpend} />}
        {tab === "reports" && <ReportsView sales={sales} spend={spend} />}
      </main>
    </div>
  );
}
