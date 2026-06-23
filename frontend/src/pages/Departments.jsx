import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', budget: '', location: '' });

  const fetchData = async () => {
    try {
      const res = await api.get('/departments', { params: { search } });
      setDepartments(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openModal = (dept = null) => {
    if (dept) {
      setEditing(dept);
      setForm({ name: dept.name, description: dept.description, budget: dept.budget, location: dept.location });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', budget: '', location: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', label: 'Description', render: (row) => <span className="truncate max-w-xs block">{row.description}</span> },
    { key: 'employeeCount', label: 'Employees' },
    { key: 'budget', label: 'Budget', render: (row) => `$${row.budget?.toLocaleString()}` },
    { key: 'location', label: 'Location' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><FiPlus /> Add Department</button>
      </div>

      {loading ? <TableSkeleton /> : (
        <DataTable columns={columns} data={departments} actions={(row) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => openModal(row)} className="p-1.5 rounded hover:bg-gray-100"><FiEdit2 size={16} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><FiTrash2 size={16} /></button>
          </div>
        )} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Budget</label><input type="number" className="input-field" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Location</label><input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
