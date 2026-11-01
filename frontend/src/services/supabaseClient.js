import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder = (val) => {
  return !val || val.includes('your-project-id') || val.includes('your-supabase-anon-key')
}

export const isConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

/**
 * Service helpers with fallback to localStorage if Supabase credentials are pending
 */
const STORAGE_KEY_PREDICTIONS = 'crop_ai_local_predictions'
const STORAGE_KEY_USER = 'crop_ai_local_user'

export const dbService = {
  // Profiles
  async getProfile(userId) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    }
    const local = localStorage.getItem(STORAGE_KEY_USER)
    return local ? JSON.parse(local) : null
  },

  async updateProfile(userId, updates) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single()
      if (error) throw error
      return data
    }
    const current = (await this.getProfile(userId)) || { id: userId }
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated))
    return updated
  },

  // Predictions
  async savePrediction(prediction) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('predictions')
        .insert([prediction])
        .select()
        .single()
      if (error) throw error
      return data
    }

    // Local storage fallback for instant demo testing
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_PREDICTIONS) || '[]')
    const newRecord = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...prediction
    }
    existing.unshift(newRecord)
    localStorage.setItem(STORAGE_KEY_PREDICTIONS, JSON.stringify(existing))
    return newRecord
  },

  async getPredictions(userId) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }

    // Local storage fallback
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_PREDICTIONS) || '[]')
    return existing.filter(p => !userId || p.user_id === userId)
  },

  async deletePrediction(predictionId, userId) {
    if (isConfigured && supabase) {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', predictionId)
        .eq('user_id', userId)
      if (error) throw error
      return true
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_PREDICTIONS) || '[]')
    const filtered = existing.filter(p => p.id !== predictionId)
    localStorage.setItem(STORAGE_KEY_PREDICTIONS, JSON.stringify(filtered))
    return true
  }
}

