import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import StoreSalesOrder from './pages/StoreSalesOrder/StoreSalesOrder'

type Role = 'admin' | 'user'

type Session = {
  username: string
  role: Role
}

const ADMIN_ID = 'admin'
const ADMIN_PASSWORD = '1234'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState('')

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUsername = username.trim()

    if (!trimmedUsername || !password) {
      setError('Please enter both ID and password.')
      return
    }

    if (trimmedUsername === ADMIN_ID) {
      if (password !== ADMIN_PASSWORD) {
        setError('Invalid admin password.')
        return
      }

      setSession({ username: trimmedUsername, role: 'admin' })
      setError('')
      return
    }

    setSession({ username: trimmedUsername, role: 'user' })
    setError('')
  }

  function handleLogout() {
    setSession(null)
    setPassword('')
    setError('')
  }

  if (session?.role === 'admin') {
    // Admin dashboard
    return (
      <main className="app-shell">
        <section className="dashboard-panel">
          <p className="eyebrow">관리자 로그인</p>
          <h1>관리자 대시보드</h1>
          <p className="dashboard-copy">
            안녕하세요, {session.username}님! 관리자 로그인 중입니다.
          </p>
          <button className="secondary-button" type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </section>
      </main>
    )
  }

  if (session?.role === 'user') {
    return <StoreSalesOrder />
  }

  return (
    <main className="app-shell">
      <section className="login-panel" aria-labelledby="login-heading">
        <div className="login-header">
          <p className="eyebrow">로그인</p>
          <h1 id="login-heading">오! 도미</h1>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="username">ID</label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit">
            Login
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
