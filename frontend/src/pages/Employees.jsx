import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import { getImageUrl } from '../utils/helpers';

const Employees = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', salary: '', skills: '', password: '' });

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees', { params: { search } }),
        api.get('/departments'),
      ]);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const openModal = (emp = null) => {
    if (emp) {
      setEditing(emp);
      setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone, position: emp.position, department: emp.department?._id || '', salary: emp.salary, skills: emp.skills?.join(', ') || '', password: '' });
    } else {
      setEditing(null);
      setForm({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', salary: '', skills: '', password: 'Employee@123' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/employees/${editing._id}`, form);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', form);
        toast.success('Employee created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'employee', label: 'Employee', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 overflow-hidden">
          {row.profileImage ? <img src={getImageUrl(row.profileImage)} alt="" className="w-full h-full object-cover" /> : row.firstName?.[0]}
        </div>
        <div><p className="font-medium">{row.firstName} {row.lastName}</p><p className="text-xs text-gray-500">{row.employeeId}</p></div>
      </div>
    )},
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department', render: (row) => row.department?.name || 'N/A' },
    { key: 'status', label: 'Status', render: (row) => <span className="badge bg-green-100 text-green-700 capitalize">{row.status}</span> },
    { key: 'productivityScore', label: 'Productivity', render: (row) => `${row.productivityScore}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isAdmin && <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><FiPlus /> Add Employee</button>}
      </div>

      {loading ? <TableSkeleton /> : (
        <DataTable columns={columns} data={employees} actions={isAdmin ? (row) => (
          <div className="flex gap-2 justify-end">
            <button onClick={() => openModal(row)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><FiEdit2 size={16} /></button>
            <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><FiTrash2 size={16} /></button>
          </div>
        ) : null} />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">First Name</label><input className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Last Name</label><input className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editing} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Position</label><input className="input-field" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium mb-1">Department</label>
            <select className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Salary</label><input type="number" className="input-field" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Skills (comma separated)</label><input className="input-field" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
          {!editing && <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Password</label><input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>}
          <div className="md:col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
