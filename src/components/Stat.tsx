

export const Stat = ({ label, value, badge }: { label: string; value: string; badge?: string }) => (
  <div className="stat"><span className="muted">{label}</span><strong>{value}</strong>{badge && <em className="pill">{badge}</em>}</div>
);
