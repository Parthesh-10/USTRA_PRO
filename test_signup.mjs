import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf-8')
const envUrl = envFile.split('\n').find(line => line.startsWith('VITE_SUPABASE_URL')).split('=')[1].trim()
const envKey = envFile.split('\n').find(line => line.startsWith('VITE_SUPABASE_ANON_KEY')).split('=')[1].trim()

const supabase = createClient(envUrl, envKey)

async function testSignup() {
  console.log("Testing signup...")
  const { data, error } = await supabase.auth.signUp({
    email: 'test_error_debug123@ustra.app',
    password: 'password123',
    options: {
      data: {
        name: "Test Debug",
        role: "customer",
        phone: "9999999999"
      }
    }
  })
  
  if (error) {
    console.error("Signup failed with error:", error)
  } else {
    console.log("Signup succeeded!", data)
  }
}

testSignup()
