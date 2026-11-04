# Shop Bookkeeping

Shop Bookkeeping is a responsive bookkeeping dashboard for small shops and wholesalers. It helps record sales, manage products and expenses, and calculate revenue and profit without a backend or account setup.

## Features

- **Sales entry:** Add products to a cart, change quantities and prices, repeat the previous sale, and save or delete transactions.
- **Fast product search:** Use names or quantity syntax such as `3 sugar` or `3x sugar`.
- **Product catalog:** Maintain buying and selling prices, profit per unit, and profit margin.
- **Expense tracking:** Record expenses by category, including stock, rent, wages, transport, utilities, and other costs.
- **Dashboard:** View today's sales, monthly sales, monthly gross profit, and monthly net profit.
- **Performance charts:** Compare sales and profit daily, weekly, monthly, or yearly.
- **Reports:** Filter revenue, cost of goods, gross profit, spending, net profit, and top products by day, week, month, year, or all time.
- **CSV export:** Download the full sales ledger with product quantities, prices, revenue, cost, and profit.
- **Local persistence:** Data is saved in the browser with `localStorage`.
- **Light and dark themes:** Switch themes or automatically use the operating system preference.

## Currency

The default currency is UGX. To change it, update the `CUR` constant in [`src/utils.ts`](src/utils.ts).

## Tech Stack

- React 18
- TypeScript
- Vite
- Browser `localStorage`
- CSS

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation and Development

```bash
npm install
npm run dev
```

Vite will print the local development URL, usually `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview
```

## Project Structure

```text
src/
├── App.tsx              Application shell and dashboard navigation
├── components/          Stat cards and performance chart
├── views/               Sales, products, spending, and reports screens
├── styles.css           Application theme and responsive styles
├── types.ts             Shared TypeScript data types
└── utils.ts             Calculations, local storage, CSV export, and currency
```

## Data Storage

Products, sales, spending records, and the selected theme are stored locally in the current browser. Clearing browser storage removes the application's saved data.
