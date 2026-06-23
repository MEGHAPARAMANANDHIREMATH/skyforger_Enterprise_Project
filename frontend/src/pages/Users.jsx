import { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { RoleBadge } from '../components/Badge';
import { TableSkeleton } from '../components/Skeleton';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'employee', isActive: true });

  const fetchData = async () => {
    try {
      const res = await api.get('/auth/users', { params: { search } });
      setUsers(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openModal = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, role: user.role, isActive: user.isActive });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/users/${editing._id}`, form);
      toast.success('User updated');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <RoleBadge role={row.role} /> },
    { key: 'isActive', label: 'Status', render: (row) => <span className={`badge ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.isActive ? 'Active' : 'Inactive'}</span> },
  ];

  return (
    <div className="space-y-6">
      <input className="input-field max-w-md" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading ? <TableSkeleton /> : (
        <DataTable columns={columns} data={users} actions={(row) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => openModal(row)} className="p-1.5 rounded hover:bg-gray-100"><FiEdit2 size={16} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><FiTrash2 size={16} /></button>
          </div>
        )} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Role</label><select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option></select></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><label className="text-sm">Active</label></div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Update</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
