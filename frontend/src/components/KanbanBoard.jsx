import { STATUS_CONFIG, KANBAN_COLUMNS, truncate, formatDate } from '../constants/status';
import './KanbanBoard.css';

export default function KanbanBoard({ complaints, onSelect, selectedId }) {
  const columns = KANBAN_COLUMNS.map((key) => ({
    key,
    ...STATUS_CONFIG[key],
    items: complaints.filter((c) => c.status === key),
  }));

  return (
    <div className="kanban-board">
      {columns.map((col) => (
        <div key={col.key} className={`kanban-column col-${col.color}`}>
          <div className="kanban-column-header">
            <span className="col-icon">{col.icon}</span>
            <span className="col-label">{col.label}</span>
            <span className="col-count">{col.items.length}</span>
          </div>
          <div className="kanban-cards">
            {col.items.length === 0 ? (
              <div className="kanban-empty">No items</div>
            ) : (
              col.items.map((c) => (
                <div
                  key={c.id}
                  className={`kanban-card ${selectedId === c.id ? 'selected' : ''}`}
                  onClick={() => onSelect(c)}
                >
                  <div className="kanban-card-top">
                    {c.risk_classification && (
                      <span className={`risk-dot risk-${c.risk_classification}`} />
                    )}
                    <span className="kanban-product">{c.product_name || 'Unnamed'}</span>
                  </div>
                  <p className="kanban-customer">{c.customer_name || '—'}</p>
                  <p className="kanban-desc">{truncate(c.description, 60)}</p>
                  <div className="kanban-card-footer">
                    <span>{formatDate(c.complaint_date || c.created_at)}</span>
                    {c.initial_severity && (
                      <span className={`severity severity-${c.initial_severity}`}>
                        {c.initial_severity}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
