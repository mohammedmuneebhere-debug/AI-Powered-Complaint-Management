export const STATUS_CONFIG = {
  pending_triage: {
    label: 'Pending Triage',
    color: 'warning',
    icon: '⏳',
    next: 'under_inspection',
    nextLabel: 'Start Inspection',
  },
  under_inspection: {
    label: 'Under Inspection',
    color: 'info',
    icon: '🔍',
    next: 'confirmed',
    nextLabel: 'Confirm Complaint',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'purple',
    icon: '✓',
    next: 'action_taken',
    nextLabel: 'Mark Action Taken',
  },
  action_taken: {
    label: 'Action Taken',
    color: 'success',
    icon: '⚡',
    next: 'resolved',
    nextLabel: 'Resolve',
  },
  resolved: {
    label: 'Resolved',
    color: 'success',
    icon: '✅',
    next: null,
    nextLabel: null,
  },
  closed: {
    label: 'Closed',
    color: 'gray',
    icon: '🔒',
    next: null,
    nextLabel: null,
  },
};

export const ACTION_TYPES = [
  'Investigation',
  'Root Cause Analysis',
  'CAPA Initiated',
  'Batch Recall',
  'Customer Response',
  'Regulatory Notification',
  'Status Change',
  'Other',
];

export const KANBAN_COLUMNS = [
  'pending_triage',
  'under_inspection',
  'confirmed',
  'action_taken',
  'resolved',
];

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function truncate(str, len = 80) {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function shortId(id) {
  if (!id) return '—';
  return id.slice(0, 8).toUpperCase();
}
