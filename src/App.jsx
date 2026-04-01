import { useState, useEffect } from 'react'
import './App.css'

const TABS = [
  { id: 'today', label: '今日' },
  { id: 'week', label: '今週' },
  { id: 'month', label: '今月' },
  { id: 'year', label: '今年' },
  { id: 'someday', label: 'いつか' },
]

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [tasks, setTasks] = useLocalStorage('tasks', {
    today: [],
    week: [],
    month: [],
    year: [],
    someday: [],
  })
  const [input, setInput] = useState('')

  const addTask = () => {
    const text = input.trim()
    if (!text) return
    setTasks(prev => ({
      ...prev,
      [activeTab]: [
        ...prev[activeTab],
        { id: Date.now(), text, done: false },
      ],
    }))
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    }))
  }

  const deleteTask = (id) => {
    setTasks(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(t => t.id !== id),
    }))
  }

  const currentTasks = tasks[activeTab] || []
  const doneTasks = currentTasks.filter(t => t.done)
  const pendingTasks = currentTasks.filter(t => !t.done)

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">タスク管理</h1>
      </header>

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {(tasks[tab.id] || []).filter(t => !t.done).length > 0 && (
              <span className="badge">
                {(tasks[tab.id] || []).filter(t => !t.done).length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="input-row">
          <input
            className="task-input"
            type="text"
            placeholder="タスクを追加..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button className="add-btn" onClick={addTask}>追加</button>
        </div>

        {currentTasks.length === 0 && (
          <p className="empty">タスクがありません。追加してみましょう！</p>
        )}

        <ul className="task-list">
          {pendingTasks.map(task => (
            <li key={task.id} className="task-item">
              <button
                className="check-btn"
                onClick={() => toggleTask(task.id)}
                aria-label="完了にする"
              >
                <span className="check-circle" />
              </button>
              <span className="task-text">{task.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
                aria-label="削除"
              >✕</button>
            </li>
          ))}
        </ul>

        {doneTasks.length > 0 && (
          <div className="done-section">
            <p className="done-label">完了 ({doneTasks.length})</p>
            <ul className="task-list">
              {doneTasks.map(task => (
                <li key={task.id} className="task-item task-item--done">
                  <button
                    className="check-btn check-btn--done"
                    onClick={() => toggleTask(task.id)}
                    aria-label="未完了に戻す"
                  >
                    <span className="check-circle check-circle--done">✓</span>
                  </button>
                  <span className="task-text task-text--done">{task.text}</span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                    aria-label="削除"
                  >✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
