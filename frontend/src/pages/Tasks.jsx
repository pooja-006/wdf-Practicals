import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTask, deleteTask, getMe, getTasks, updateTask } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import Spinner from '../components/Spinner'

function Tasks({ onNotify }) {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const loadTasks = async () => {
    setLoading(true); setError(null)
    try { const [taskData, userData] = await Promise.all([getTasks(), getMe()]); setTasks(taskData); setUser(userData) }
    catch (requestError) { if (requestError.status === 401) { localStorage.removeItem('token'); navigate('/login'); onNotify('Please log in to manage tasks.') } else setError(requestError.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { if (!localStorage.getItem('token')) { navigate('/login'); return }; loadTasks() }, [])

  const addTask = async (event) => {
    event.preventDefault(); setSaving(true); setError(null)
    try { const newTask = await createTask(form); setTasks([newTask, ...tasks]); setForm({ title: '', description: '', priority: 'medium' }); onNotify('Task created.') }
    catch (requestError) { setError(requestError.message) }
    finally { setSaving(false) }
  }
  const toggleTask = async (task) => {
    try { const updated = await updateTask(task._id, { ...task, completed: !task.completed }); setTasks(tasks.map((item) => item._id === updated._id ? updated : item)); onNotify('Task updated.') }
    catch (requestError) { setError(requestError.message) }
  }
  const removeTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try { await deleteTask(id); setTasks(tasks.filter((task) => task._id !== id)); onNotify('Task deleted.') }
    catch (requestError) { setError(requestError.message) }
  }

  return <section className="page-section"><div className="section-heading"><div><p className="section-label">07 / Workspace</p><h1>Task desk</h1></div><span className="count-label">{user ? user.email : 'Private'}</span></div>
    <form className="task-form" onSubmit={addTask}><label className="form-field">Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label><label className="form-field">Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="form-field">Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>low</option><option>medium</option><option>high</option></select></label><button className="button" disabled={saving}>{saving ? 'Adding...' : 'Add task'}</button></form>
    {error && <ErrorMessage message={error} onRetry={loadTasks} />}{loading ? <Spinner /> : <div className="task-list">{tasks.length ? tasks.map((task) => <article className={task.completed ? 'task-item done' : 'task-item'} key={task._id}><h3>{task.title}</h3><p>{task.description || 'No description'} · {task.priority}</p><div className="task-buttons"><button onClick={() => toggleTask(task)}>{task.completed ? 'Reopen' : 'Complete'}</button><button onClick={() => removeTask(task._id)}>Delete</button></div></article>) : <p className="empty-state">No tasks yet. Add the first one above.</p>}</div>}
  </section>
}

export default Tasks
