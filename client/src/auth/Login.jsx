import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await Axios({
        method: SummaryApi.AdminLogin.method,
        url: SummaryApi.AdminLogin.url,
        data: { username, password }
      })
      if (response.data.success) {
        localStorage.setItem('admin_logged_in', 'true')
        localStorage.setItem('accessToken', response.data.token)
        navigate('/admin/dashboard')
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials and network connection.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-slate-900 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col items-center mb-6">
          <span className="text-3xl mb-2">🛍️</span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">
            Admin Login
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
            Clothing POS Control Panel
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-[#3B82F6] text-sm"
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-[#3B82F6] text-sm"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold transition shadow-lg text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
