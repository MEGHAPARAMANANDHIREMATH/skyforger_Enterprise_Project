import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { formatDate } from '../utils/helpers';

const Tasks = () => {
  const { isManager } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', status: 'todo', priority: 'medium', dueDate: '' });

  const fetchData = async () => {
    try {
      const [taskRes, projRes, empRes] = await Promise.all([
        api.get('/tasks', { params: { search, status: statusFilter } }),
        api.get('/projects'),
        isManager ? api.get('/employees') : Promise.resolve({ data: { data: [] } }),
      ]);
      setTasks(taskRes.data.data);
      setProjects(projRes.data.data);
      setEmployees(empRes.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      toast.success('Task created');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const columns = [
    { key: 'title', label: 'Task', render: (row) => <Link to={`/tasks/${row._id}`} className="font-medium hover:text-primary-600">{row.title}</Link> },
    { key: 'project', label: 'Project', render: (row) => row.project?.name },
    { key: 'assignedTo', label: 'Assignee', render: (row) => row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : 'Unassigned' },
    { key: 'status', label: 'Status', render: (row) => (
      <select value={row.status} onChange={(e) => handleStatusChange(row._id, e.target.value)} className="text-xs border rounded px-2 py-1 bg-transparent" onClick={(e) => e.stopPropagation()}>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="review">Review</option>
        <option value="completed">Completed</option>
      </select>
    )},
    { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
    { key: 'dueDate', label: 'Due Date', render: (row) => formatDate(row.dueDate) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {isManager && <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><FiPlus /> New Task</button>}
      </div>

      {loading ? <TableSkeleton /> : <DataTable columns={columns} data={tasks} />}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title</label><input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Project</label><select className="input-field" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required><option value="">Select Project</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Assign To</label><select className="input-field" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}><option value="">Unassigned</option>{employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Priority</label><select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Due Date</label><input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
