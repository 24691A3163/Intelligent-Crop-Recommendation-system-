import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isConfigured, dbService } from '../services/supabaseClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      if (isConfigured && supabase) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession()
          if (initialSession?.user && mounted) {
            setSession(initialSession)
            setUser(initialSession.user)
            loadProfile(initialSession.user.id)
          }
        } catch (err) {
          console.warn('Error loading Supabase session:', err)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) return
          setSession(newSession)
          if (newSession?.user) {
            setUser(newSession.user)
            loadProfile(newSession.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
        })

        if (mounted) setLoading(false)
        return () => {
          subscription?.unsubscribe()
        }
      } else {
        // Fallback: Check local storage for demo session
        const savedUser = localStorage.getItem('crop_ai_auth_demo_user')
        if (savedUser && mounted) {
          try {
            const parsed = JSON.parse(savedUser)
            setUser(parsed)
            setProfile({ full_name: parsed.user_metadata?.full_name || 'Agricultural Researcher', email: parsed.email })
          } catch (e) {
            console.error(e)
          }
        }
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [])

  const loadProfile = async (userId) => {
    try {
      const data = await dbService.getProfile(userId)
      if (data) setProfile(data)
    } catch (err) {
      console.warn('Error loading profile:', err)
    }
  }

  const signUp = async (email, password, fullName) => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      if (error) throw error
      return data
    } else {
      // Local fallback mock signup
      const newUser = {
        id: crypto.randomUUID(),
        email,
        user_metadata: { full_name: fullName },
        created_at: new Date().toISOString()
      }
      localStorage.setItem('crop_ai_auth_demo_user', JSON.stringify(newUser))
      setUser(newUser)
      setProfile({ full_name: fullName, email })
      return { user: newUser }
    }
  }

  const signIn = async (email, password) => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } else {
      // Local fallback mock login
      const newUser = {
        id: 'demo-user-12345',
        email,
        user_metadata: { full_name: 'Dr. Jane Miller (Agronomist)' },
        created_at: new Date().toISOString()
      }
      localStorage.setItem('crop_ai_auth_demo_user', JSON.stringify(newUser))
      setUser(newUser)
      setProfile({ full_name: newUser.user_metadata.full_name, email })
      return { user: newUser }
    }
  }

  const signOut = async () => {
    if (isConfigured && supabase) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('crop_ai_auth_demo_user')
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const resetPassword = async (email) => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      return data
    }
    return { success: true }
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated')
    const updated = await dbService.updateProfile(user.id, updates)
    setProfile(updated)
    return updated
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

