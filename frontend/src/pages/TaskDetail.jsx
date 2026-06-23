import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUpload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { formatDate, formatDateTime } from '../utils/helpers';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTask = async () => {
    try {
      const [taskRes, commentRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/tasks/${id}/comments`),
      ]);
      setTask(taskRes.data.data);
      setComments(commentRes.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTask(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchTask();
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'document');
    formData.append('taskId', id);
    try {
      await api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File uploaded');
      fetchTask();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      toast.success('Status updated');
      fetchTask();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!task) return <div className="card text-center py-12">Task not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><FiArrowLeft /> Back to Tasks</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <p className="text-gray-500 mt-2">{task.description}</p>
            <div className="flex gap-2 mt-4">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">{c.user?.name?.[0]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium">{c.user?.name}</span><span className="text-xs text-gray-400">{formatDateTime(c.createdAt)}</span></div>
                    <p className="text-sm mt-1">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input className="input-field flex-1" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <button type="submit" className="btn-primary px-3"><FiSend size={16} /></button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-semibold">Details</h3>
            <div><p className="text-xs text-gray-500">Status</p>
              <select value={task.status} onChange={(e) => handleStatusChange(e.target.value)} className="input-field mt-1">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div><p className="text-xs text-gray-500">Project</p><p className="font-medium">{task.project?.name}</p></div>
            <div><p className="text-xs text-gray-500">Assignee</p><p className="font-medium">{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</p></div>
            <div><p className="text-xs text-gray-500">Due Date</p><p className="font-medium">{formatDate(task.dueDate)}</p></div>
            <div><p className="text-xs text-gray-500">Assigned By</p><p className="font-medium">{task.assignedBy?.name || 'N/A'}</p></div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Attachments</h3>
            <label className="btn-secondary flex items-center gap-2 justify-center cursor-pointer mb-3">
              <FiUpload size={16} /> Upload File
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            {task.attachments?.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((f) => (
                  <a key={f._id} href={`http://localhost:5000${f.path}`} target="_blank" rel="noreferrer" className="block text-sm text-primary-600 hover:underline">{f.originalName}</a>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500">No attachments</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
