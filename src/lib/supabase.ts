import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

supabase
  .from('salons')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error)
    } else {
      console.log('✅ Supabase connected successfully')
      console.log(data)
    }
  })

  