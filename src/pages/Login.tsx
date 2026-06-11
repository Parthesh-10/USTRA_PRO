import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Slice } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(identifier, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Get the logged-in user's role to redirect appropriately
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (userData?.role === 'owner') {
          navigate('/owner-dashboard')
        } else if (userData?.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]/50 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FFFFFF]/40 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#4A7B9D]/10 blur-[100px]" />
      </div>

      {/* Back to home */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#9AA899] hover:text-primary hover:bg-[#FFFFFF]/30 font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-[#FFFFFF]/50 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6">
            <Slice className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#54577C] tracking-tight">Welcome Back</h1>
          <p className="text-[#9AA899] font-medium mt-2">Sign in to your USTRA PRO account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#54577C] ml-1">Mobile or Email</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full bg-[#FFFFFF]/30 border border-[#FFFFFF] rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-[#54577C] font-medium placeholder:text-[#9AA899]"
              placeholder="10-digit mobile or email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-sm font-bold text-[#54577C]">Password</label>
              <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot?</button>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#FFFFFF]/30 border border-[#FFFFFF] rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-[#54577C] font-medium placeholder:text-[#9AA899]"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#FFFFFF]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-[#9AA899] font-bold tracking-widest">New to USTRA?</span>
          </div>
        </div>

        <p className="text-center text-sm font-medium text-[#54577C]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  )
}