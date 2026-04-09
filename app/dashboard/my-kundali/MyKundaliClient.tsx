'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { FileImage, Star } from 'lucide-react'

interface KundaliImage { url: string; publicId: string; uploadedAt: string }
interface Kundali { _id: string; images: KundaliImage[]; notes?: string; createdAt: string }

export default function MyKundaliClient({ kundali }: { kundali: Kundali | null }) {
  const [lightboxIdx, setLightboxIdx] = useState(-1)

  const slides = kundali?.images.map((img) => ({ src: img.url })) ?? []

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)', fontFamily: 'var(--font-cinzel)' }}>
            My Account
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
            My Kundali Charts
          </h1>
        </motion.div>

        {!kundali || kundali.images.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mystic-card p-12 text-center">
            <FileImage size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--text-primary)' }}>
              No Charts Yet
            </h2>
            <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Your Kundali charts will appear here once your astrologer uploads them after your consultation.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 mystic-card p-4 flex items-center gap-3"
            >
              <Star size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} fill="currentColor" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {kundali.images.length} chart{kundali.images.length > 1 ? 's' : ''} uploaded ·
                Click any image to view full size
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {kundali.images.map((img, i) => (
                <motion.button
                  key={img.publicId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setLightboxIdx(i)}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                  style={{ border: '1px solid rgba(201,168,76,0.15)' }}
                  aria-label={`View chart ${i + 1}`}
                >
                  <Image
                    src={img.url} alt={`Kundali chart ${i + 1}`}
                    fill className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <Lightbox
              open={lightboxIdx >= 0}
              close={() => setLightboxIdx(-1)}
              index={lightboxIdx}
              slides={slides}
              styles={{
                container: { backgroundColor: 'rgba(5,5,16,0.95)' },
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
