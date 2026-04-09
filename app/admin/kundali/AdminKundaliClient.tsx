'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Upload, Trash2, Save, Search, FileImage, X, Loader2 } from 'lucide-react'

interface Client { _id: string; name: string; email: string }
interface KundaliImage { url: string; publicId: string; uploadedAt: string }
interface Kundali {
  _id: string
  clientId: { _id: string; name: string; email: string }
  images: KundaliImage[]
  notes?: string
  createdAt: string
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

export default function AdminKundaliClient({
  clients,
  initialKundalis,
}: {
  clients: Client[]
  initialKundalis: Kundali[]
}) {
  const [kundalis, setKundalis] = useState(initialKundalis)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [tableSearch, setTableSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const clientKundali = selectedClient
    ? kundalis.find((k) => k.clientId._id === selectedClient._id)
    : null

  async function handleUpload(files: FileList) {
    if (!selectedClient || !files.length) return
    setUploading(true)
    setMsg('')

    try {
      // Get signed params
      const signRes = await fetch('/api/kundali/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient._id }),
      })
      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json()

      const uploaded: { url: string; publicId: string }[] = []

      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', apiKey)
        fd.append('timestamp', String(timestamp))
        fd.append('signature', signature)
        fd.append('folder', folder)

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: fd }
        )
        const data = await res.json()
        if (data.secure_url) {
          uploaded.push({ url: data.secure_url, publicId: data.public_id })
        }
      }

      if (!uploaded.length) { setMsg('Upload failed.'); return }

      // Save to MongoDB
      const saveRes = await fetch('/api/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient._id,
          images: uploaded.map((u) => ({ ...u, uploadedAt: new Date().toISOString() })),
          notes,
        }),
      })
      const saved = await saveRes.json()
      setKundalis((prev) => {
        const idx = prev.findIndex((k) => k.clientId._id === selectedClient._id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...saved, clientId: { _id: selectedClient._id, name: selectedClient.name, email: selectedClient.email } }
          return updated
        }
        return [{ ...saved, clientId: { _id: selectedClient._id, name: selectedClient.name, email: selectedClient.email } }, ...prev]
      })
      setMsg(`✓ ${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded.`)
    } catch (err) {
      console.error(err)
      setMsg('Upload error.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDeleteImage(kundaliId: string, publicId: string) {
    if (!confirm('Delete this image?')) return
    setDeleting(publicId)
    try {
      const res = await fetch('/api/kundali/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundaliId, publicId }),
      })
      if (res.ok) {
        setKundalis((prev) =>
          prev.map((k) =>
            k._id === kundaliId
              ? { ...k, images: k.images.filter((img) => img.publicId !== publicId) }
              : k
          )
        )
        setMsg('✓ Image deleted.')
      }
    } catch { setMsg('Delete failed.') }
    finally { setDeleting(null) }
  }

  async function handleSaveNotes() {
    if (!clientKundali) return
    setSavingNotes(true)
    try {
      await fetch('/api/kundali', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundaliId: clientKundali._id, notes }),
      })
      setKundalis((prev) =>
        prev.map((k) => (k._id === clientKundali._id ? { ...k, notes } : k))
      )
      setMsg('✓ Notes saved.')
    } catch { setMsg('Save failed.') }
    finally { setSavingNotes(false) }
  }

  const filteredTable = kundalis.filter(
    (k) =>
      k.clientId.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      k.clientId.email.toLowerCase().includes(tableSearch.toLowerCase())
  )

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            Admin
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            Kundali Management
          </h1>
        </motion.div>

        {msg && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Client selector + upload */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mystic-card p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>Upload Kundali</h2>

            {/* Client search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="Search client by name or email…"
                value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px' }}
              />
            </div>

            {clientSearch && !selectedClient && (
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.15)', background: 'var(--bg-card)' }}>
                {filteredClients.slice(0, 6).map((c) => (
                  <button
                    key={c._id}
                    onClick={() => { setSelectedClient(c); setClientSearch(c.name); setNotes(kundalis.find((k) => k.clientId._id === c._id)?.notes ?? '') }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(201,168,76,0.08)' }}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{c.email}</span>
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>No clients found.</p>
                )}
              </div>
            )}

            {selectedClient && (
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedClient.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedClient.email}</p>
                </div>
                <button onClick={() => { setSelectedClient(null); setClientSearch('') }} style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* File upload */}
            <div>
              <input
                ref={fileRef} type="file" accept="image/*" multiple
                className="hidden"
                id="kundali-upload"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
                disabled={!selectedClient || uploading}
              />
              <label
                htmlFor="kundali-upload"
                className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold cursor-pointer transition-all hover:scale-105"
                style={{
                  background: selectedClient ? 'linear-gradient(135deg, var(--gold-dark), var(--gold))' : 'rgba(255,255,255,0.05)',
                  color: selectedClient ? '#0a0a1a' : 'var(--text-muted)',
                  cursor: selectedClient ? 'pointer' : 'not-allowed',
                }}
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? 'Uploading…' : 'Select & Upload Images'}
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--gold)' }}>
                Private Notes (astrologer only)
              </label>
              <textarea
                rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this Kundali…"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {clientKundali && (
              <button
                onClick={handleSaveNotes} disabled={savingNotes}
                className="flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105 disabled:opacity-60"
                style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}
              >
                <Save size={13} /> {savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            )}
          </motion.div>

          {/* Selected client images */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mystic-card p-6">
            <h2 className="text-sm font-semibold gold-text mb-4" style={{ fontFamily: 'var(--font-cinzel)' }}>
              {selectedClient ? `${selectedClient.name}'s Charts` : 'Select a client to view charts'}
            </h2>

            {!selectedClient && (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <FileImage size={32} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No client selected</p>
              </div>
            )}

            {selectedClient && !clientKundali?.images.length && (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <FileImage size={32} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No charts uploaded yet</p>
              </div>
            )}

            {clientKundali && clientKundali.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {clientKundali.images.map((img) => (
                  <div key={img.publicId} className="relative group rounded-lg overflow-hidden aspect-square">
                    <Image
                      src={img.url} alt="Kundali chart"
                      fill className="object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteImage(clientKundali._id, img.publicId)}
                        disabled={deleting === img.publicId}
                        className="p-2 rounded-full transition-all hover:scale-110"
                        style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}
                        aria-label="Delete image"
                      >
                        {deleting === img.publicId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* All Kundalis table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold gold-text" style={{ fontFamily: 'var(--font-cinzel)' }}>
              All Kundalis ({kundalis.length})
            </h2>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text" placeholder="Search…" value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{ ...inputStyle, width: '200px', paddingLeft: '30px', padding: '8px 12px 8px 30px' }}
              />
            </div>
          </div>

          <div className="mystic-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                  {['Client', 'Email', 'Images', 'Notes', 'Uploaded'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wide" style={{ color: 'var(--gold)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTable.map((k) => (
                  <tr key={k._id} style={{ borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{k.clientId.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{k.clientId.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)' }}>
                        {k.images.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {k.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(k.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
                {filteredTable.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No Kundalis found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
