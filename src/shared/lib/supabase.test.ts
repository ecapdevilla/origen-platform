import { describe, expect, it } from 'vitest'
import { supabase } from './supabase'

describe('supabase client fallback', () => {
  it('initializes without env vars and returns an empty session', async () => {
    const result = await supabase.auth.getSession()

    expect(result.error).toBeNull()
    expect(result.data.session).toBeNull()
  })
})
