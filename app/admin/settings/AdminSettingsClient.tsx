'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Upload, Loader2 } from 'lucide-react'

interface Pricing { service: string; price: number }
interface Settings {
  _id: string
  bio: string
  tagline: string
  photoUrl?: string
  yearsExperience: number
  specialisations: string[]
  languages: string[]
  pricing: Pricing[]
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  padding: '10px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}

export default function AdminSettingsClient({ settings: init }: { settings: Settings }) {
  const [form, setForm] = useState(init)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  function set(key: keyof Settings, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true)
    try {
      const signRes = await fetch('/api/kundali/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'astrologer-profile' }),
      })
      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('api_key', apiKey)
      fd.append('timestamp', String(timestamp))
      fd.append('signature', signature)
      fd.append('folder', folder)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) {
        setForm((f) => ({ ...f, photoUrl: data.secure_url, photoPublicId: data.public_id }))
        setMsg('✓ Photo uploaded.')
      }
    } catch { setMsg('Photo upload failed.') }
    finally { setUploading(false) }
  }

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) setMsg('✓ Settings saved.')
      else setMsg(data.error || 'Save failed.')
    } catch { setMsg('Network error.') }
    finally { setSaving(false) }
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>Admin</p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>Settings</h1>
        </motion.div>

        {msg && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            {msg}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Profile photo */}
          <div className="mystic-card p-6">
            <h2 className="text-sm font-semibold gold-text mb-4" style={{ fontFamily: 'var(--font-cinzel)' }}>Profile Photo</h2>
            <div className="flex items-center gap-4">
              {form.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" style={{ border: '2px solid rgba(201,168,76,0.3)' }} />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)', border: '2px solid rgba(201,168,76,0.2)' }}>
                  <Upload size={24} style={{ color: 'var(--gold)' }} />
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
                <span className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                </span>
              </label>
            </div>
          </div>

          {/* Bio & tagline */}
          <div className="mystic-card p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>Profile Info</h2>
            <div>
              <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Tagline</label>
              <input type="text" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Bio</label>
              <textarea rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Years of Experience</label>
              <input type="number" value={form.yearsExperience} onChange={(e) => set('yearsExperience', +e.target.value)} style={{ ...inputStyle, width: '120px' }} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Specialisations (comma-separated)</label>
              <input type="text" value={form.specialisations.join(', ')}
                onChange={(e) => set('specialisations', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--gold)' }}>Languages (comma-separated)</label>
              <input type="text" value={form.languages.join(', ')}
                onChange={(e) => set('languages', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                style={inputStyle} />
            </div>
          </div>

          {/* Pricing */}
          <div className="mystic-card p-6">
            <h2 className="text-sm font-semibold gold-text mb-4" style={{ fontFamily: 'var(--font-cinzel)' }}>Consultation Pricing (INR)</h2>
            <div className="flex flex-col gap-3">
              {form.pricing.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input type="text" value={p.service}
                    onChange={(e) => { const pr = [...form.pricing]; pr[i] = { ...pr[i], service: e.target.value }; set('pricing', pr) }}
                    style={{ ...inputStyle, flex: 2 }} placeholder="Service name" />
                  <input type="number" value={p.price}
                    onChange={(e) => { const pr = [...form.pricing]; pr[i] = { ...pr[i], price: +e.target.value }; set('pricing', pr) }}
                    style={{ ...inputStyle, flex: 1 }} placeholder="Price" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm tracking-wide transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a1a' }}
          >
            <Save size={15} /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
