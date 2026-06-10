import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, User, Phone, Lock, Mail, Store, Slice } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer' | 'owner'>('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate phone for customers
    if (role === 'customer') {
      const cleanPhone = phone.replace(/\s+/g, '').replace('+91', '')
      if (cleanPhone.length !== 10 || !/^\d+$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit mobile number')
        setLoading(false)
        return
      }
      // Generate email from phone behind the scenes
      const generatedEmail = `${cleanPhone}@ustra.app`
      const { error } = await signUp(generatedEmail, password, name, role, phone)
      if (error) {
        if (error.message.includes('already registered')) {
          setError('This mobile number is already registered. Please login.')
        } else {
          setError(error.message)
        }
        setLoading(false)
      } else {
        navigate('/')
      }
    } else {
      // Owner uses email
      const { error } = await signUp(email, password, name, role)
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]/50 relative overflow-hidden px-4">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FFFFFF]/40 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#4A7B9D]/10 blur-[100px]" />
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
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6">
            <Slice className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#54577C] tracking-tight">Create Account</h1>
          <p className="text-[#9AA899] font-medium mt-2">Join USTRA PRO today</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-8 p-1.5 bg-[#FFFFFF]/50 rounded-2xl border border-[#FFFFFF]">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              role === 'customer'
                ? 'bg-white text-primary shadow-sm'
                : 'text-[#9AA899] hover:text-[#54577C]'
            }`}
          >
            <User className="w-4 h-4" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              role === 'owner'
                ? 'bg-white text-primary shadow-sm'
                : 'text-[#9AA899] hover:text-[#54577C]'
            }`}
          >
            <Store className="w-4 h-4" />
            Partner
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#54577C] ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA899]" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#FFFFFF]/30 border border-[#FFFFFF] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-[#54577C] font-medium placeholder:text-[#9AA899]"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Customer: Phone | Owner: Email */}
          {role === 'customer' ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#54577C] ml-1">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#9AA899]" />
                  <span className="text-sm font-bold text-[#9AA899]">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full bg-[#FFFFFF]/30 border border-[#FFFFFF] rounded-xl pl-20 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-[#54577C] font-medium placeholder:text-[#9AA899]"
                  placeholder="9876543210"
                  required
                  maxLength={10}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#54577C] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA899]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#FFFFFF]/30 border border-[#FFFFFF] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-[#54577C] font-medium placeholder:text-[#9AA899]"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#54577C] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA899]" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#FFFFFF]/30 border border-[#FFFFFF] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-[#54577C] font-medium placeholder:text-[#9AA899]"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-[#54577C] mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}