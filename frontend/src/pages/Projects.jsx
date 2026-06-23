import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/Skeleton';
import { capitalize, formatDate, PROJECT_STATUS_COLORS } from '../utils/helpers';

const Projects = () => {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'planning', priority: 'medium', startDate: '', endDate: '', department: '', budget: '', teamMembers: [] });

  const fetchData = async () => {
    try {
      const [projRes, deptRes, empRes] = await Promise.all([
        api.get('/projects', { params: { search, status: statusFilter } }),
        api.get('/departments'),
        isManager ? api.get('/employees') : Promise.resolve({ data: { data: [] } }),
      ]);
      setProjects(projRes.data.data);
      setDepartments(deptRes.data.data);
      setEmployees(empRes.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter]);

  const openModal = (proj = null) => {
    if (proj) {
      setEditing(proj);
      setForm({ name: proj.name, description: proj.description, status: proj.status, priority: proj.priority, startDate: proj.startDate?.split('T')[0], endDate: proj.endDate?.split('T')[0], department: proj.department?._id || '', budget: proj.budget, teamMembers: proj.teamMembers?.map((m) => m._id) || [] });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', status: 'planning', priority: 'medium', startDate: '', endDate: '', department: '', budget: '', teamMembers: [] });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/projects/${editing._id}`, form);
        toast.success('Project updated');
      } else {
        await api.post('/projects', form);
        toast.success('Project created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleMember = (id) => {
    setForm((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(id) ? prev.teamMembers.filter((m) => m !== id) : [...prev.teamMembers, id],
    }));
  };

  if (loading) return <CardSkeleton count={3} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        {isManager && <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><FiPlus /> New Project</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div key={proj._id} className="card hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-3">
              <Link to={`/projects/${proj._id}`} className="font-semibold text-lg hover:text-primary-600 transition">{proj.name}</Link>
              {isManager && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openModal(proj)} className="p-1 rounded hover:bg-gray-100"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(proj._id)} className="p-1 rounded hover:bg-red-50 text-red-600"><FiTrash2 size={14} /></button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{proj.description}</p>
            <div className="flex gap-2 mb-3">
              <span className={`badge ${PROJECT_STATUS_COLORS[proj.status]}`}>{capitalize(proj.status)}</span>
              <span className="badge bg-gray-100 text-gray-600">{capitalize(proj.priority)}</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span>Progress</span><span>{proj.progress}%</span></div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${proj.progress}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatDate(proj.startDate)} - {formatDate(proj.endDate)}</span>
              <span>{proj.teamMembers?.length || 0} members</span>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && <div className="card text-center py-12 text-gray-500">No projects found</div>}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Project' : 'New Project'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Name</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Status</label><select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="planning">Planning</option><option value="active">Active</option><option value="on-hold">On Hold</option><option value="completed">Completed</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Priority</label><select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" className="input-field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
            <div><label className="block text-sm font-medium mb-1">Department</label><select className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}><option value="">Select</option>{departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Budget</label><input type="number" className="input-field" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
          </div>
          {employees.length > 0 && (
            <div><label className="block text-sm font-medium mb-2">Team Members</label>
              <div className="flex flex-wrap gap-2">{employees.map((e) => (
                <button key={e._id} type="button" onClick={() => toggleMember(e._id)} className={`px-3 py-1 rounded-full text-xs border transition ${form.teamMembers.includes(e._id) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 hover:border-primary-400'}`}>
                  {e.firstName} {e.lastName}
                </button>
              ))}</div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
