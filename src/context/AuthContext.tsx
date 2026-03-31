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
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUser(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
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

  async function signUp(email: string, password: string, name: string, role = 'customer') {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    })
    return { error }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
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