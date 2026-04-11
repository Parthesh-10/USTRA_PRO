import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'owner' | 'admin'
  phone?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string, role?: string, phone?: string) => Promise<{ error: any }>
  signIn: (emailOrPhone: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUser(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) fetchUser(session.user.id)
        else { setUser(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUser(id: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    setUser(data)
    setLoading(false)
  }

  async function signUp(email: string, password: string, name: string, role = 'customer', phone?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role, phone: phone || '' } }
    })
    // If signup succeeded and phone provided, update users table with phone
    if (!error && phone) {
      // Small delay for trigger to create user row
      setTimeout(async () => {
        await supabase
          .from('users')
          .update({ phone })
          .eq('email', email)
      }, 1000)
    }
    return { error }
  }

  async function signIn(emailOrPhone: string, password: string) {
    let loginEmail = emailOrPhone

    // If it looks like a phone number (10 digits), convert to generated email
    const cleanInput = emailOrPhone.replace(/\s+/g, '').replace('+91', '')
    if (/^\d{10}$/.test(cleanInput)) {
      loginEmail = `${cleanInput}@ustra.app`
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}