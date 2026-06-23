import { useEffect, useState } from 'react';
import { FiDownload, FiFileText, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatDateTime, UPLOAD_BASE } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const generate = async (type) => {
    setGenerating(type);
    try {
      await api.post(`/reports/${type}`);
      toast.success('Report generated successfully');
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted');
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const reportTypes = [
    { type: 'employee', title: 'Employee Performance', desc: 'Productivity scores and task completion metrics', icon: '👥' },
    { type: 'project', title: 'Project Status', desc: 'Progress, timelines, and task breakdowns', icon: '📁' },
    { type: 'productivity', title: 'Productivity Analysis', desc: 'Task distribution and completion trends', icon: '📊' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((rt) => (
          <div key={rt.type} className="card hover:shadow-md transition">
            <div className="text-3xl mb-3">{rt.icon}</div>
            <h3 className="font-semibold">{rt.title}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">{rt.desc}</p>
            <button onClick={() => generate(rt.type)} disabled={generating === rt.type} className="btn-primary w-full">
              {generating === rt.type ? 'Generating...' : 'Generate PDF Report'}
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Generated Reports</h3>
        {reports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reports generated yet</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <FiFileText className="text-primary-600" size={20} />
                  <div>
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(r.createdAt)} · {r.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.filePath && (
                    <a href={`${UPLOAD_BASE}${r.filePath}`} target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-1 text-sm py-1.5">
                      <FiDownload size={14} /> Download
                    </a>
                  )}
                  <button onClick={() => handleDelete(r._id)} className="p-2 rounded hover:bg-red-50 text-red-600"><FiTrash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
