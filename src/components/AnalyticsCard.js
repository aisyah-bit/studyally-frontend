// /src/components/AnalyticsCard.js
import "./AnalyticsCard.css";

export default function AnalyticsCard({ title, value, percent, ringColor = "purple" }) {
  return (
    <div className="analytics-card">
      <div className="card-content">
        <div>
          <p className="card-title">{title}</p>
          <h2 className="card-value">{value}</h2>
        </div>
        <div className={`ring ${ringColor}`}>
          <span>{percent}</span>
        </div>
      </div>
    </div>
  );
}
