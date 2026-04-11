import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, User, Phone, Lock, Mail, Store } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4">

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="bg-card p-8 rounded-2xl shadow-card w-full max-w-md border border-border">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-bold text-lg">U</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join USTRA PRO today</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-xl">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
              role === 'customer'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
              role === 'owner'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Store className="w-4 h-4" />
            Salon Owner
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Customer: Phone | Owner: Email */}
          {role === 'customer' ? (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full border border-border rounded-lg pl-16 pr-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="98765 43210"
                  required
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">We'll use this to identify your account</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}