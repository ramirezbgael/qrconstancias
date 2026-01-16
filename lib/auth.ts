/**
 * Utilidades de autenticación
 */
import { supabase } from './supabaseClient'

export interface AuthUser {
  id: string
  email: string
}

/**
 * Iniciar sesión con email y password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Verificar si hay una sesión activa
 */
export async function checkSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}
