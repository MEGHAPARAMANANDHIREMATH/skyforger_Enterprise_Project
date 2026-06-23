import { STATUS_COLORS, PRIORITY_COLORS, capitalize } from '../utils/helpers';

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || STATUS_COLORS.todo}`}>
    {capitalize(status)}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium}`}>
    {capitalize(priority)}
  </span>
);

export const RoleBadge = ({ role }) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    employee: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  };
  return <span className={`badge ${colors[role]}`}>{capitalize(role)}</span>;
};
