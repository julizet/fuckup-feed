'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { HumanVerification } from '@/components/human-verification'
import { filterContent } from '@/lib/content-filter'
import { ImagePlus, X, MapPin, Hash, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SubmitFormProps {
  userId: string
}

export function SubmitForm({ userId }: SubmitFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [hashtagInput, setHashtagInput] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [humanVerified, setHumanVerified] = useState(false)

  const handleVerified = useCallback((passed: boolean) => {
    setHumanVerified(passed)
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function addHashtag() {
    const tag = hashtagInput.trim().replace(/^#/, '').toLowerCase()
    if (tag && !hashtags.includes(tag) && hashtags.length < 5) {
      setHashtags(prev => [...prev, tag])
      setHashtagInput('')
    }
  }

  function removeHashtag(tag: string) {
    setHashtags(prev => prev.filter(t => t !== tag))
  }

  function handleHashtagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addHashtag()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
      return
    }
    if (!humanVerified) {
      setError('Please complete the human verification steps above.')
      return
    }
    // Content filter check
    const filter = filterContent(title, description, ...hashtags)
    if (filter.blocked) {
      setError(
        'Your post contains language that is not allowed on this platform. ' +
        'FuckUp Feed exists to amplify voices against hate — not to spread it. ' +
        'Please revise your content.',
      )
      return
    }
    setLoading(true)
    setError(null)

    try {
      let image_url: string | null = null

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Upload failed')
        image_url = json.url
      }

      const supabase = createClient()
      const { error: insertError } = await supabase.from('posts').insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        category,
        hashtags,
        image_url,
      })

      if (insertError) throw new Error(insertError.message)

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Category */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Category
        </Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-all',
                category === cat.value
                  ? `border-transparent text-white ${cat.color}`
                  : 'border-border bg-secondary text-muted-foreground hover:border-primary hover:text-foreground',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Title <span className="text-primary">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What happened? Give it a clear, punchy title."
          maxLength={120}
          required
          className="bg-input border-border"
        />
        <span className="text-right text-xs text-muted-foreground">{title.length}/120</span>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          What happened? <span className="text-primary">*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the incident in detail. Be specific. Stick to facts."
          rows={5}
          maxLength={2000}
          required
          className="resize-none bg-input border-border"
        />
        <span className="text-right text-xs text-muted-foreground">{description.length}/2000</span>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          Location (optional)
        </Label>
        <Input
          id="location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="City, Country — e.g. Berlin, Germany"
          maxLength={100}
          className="bg-input border-border"
        />
      </div>

      {/* Hashtags */}
      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          Hashtags (up to 5)
        </Label>
        <div className="flex gap-2">
          <Input
            value={hashtagInput}
            onChange={e => setHashtagInput(e.target.value)}
            onKeyDown={handleHashtagKeyDown}
            placeholder="Type a tag and press Enter"
            className="bg-input border-border"
          />
          <Button type="button" variant="outline" onClick={addHashtag} className="border-border">
            Add
          </Button>
        </div>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {hashtags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-semibold text-primary"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="ml-0.5 text-primary/60 hover:text-primary transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Photo evidence (optional, max 10MB)
        </Label>
        {imagePreview ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            <Image
              src={imagePreview}
              alt="Preview"
              width={640}
              height={360}
              className="h-56 w-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 transition-colors hover:border-primary hover:bg-secondary"
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload an image</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Human Verification */}
      <HumanVerification onVerified={handleVerified} />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !humanVerified}
        className={cn(
          'w-full gap-2 transition-opacity',
          humanVerified
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-primary/40 text-primary-foreground/50 cursor-not-allowed',
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Fuck-Up Report'
        )}
      </Button>
    </form>
  )
}
