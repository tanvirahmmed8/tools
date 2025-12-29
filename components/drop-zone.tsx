"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload } from "lucide-react"

interface DropZoneProps {
  onFileUpload: (file: File) => void
}

export function DropZone({ onFileUpload }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        onFileUpload(file)
      }
    },
    [onFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileUpload(file)
      }
    },
    [onFileUpload],
  )

  return (
    <label
      className={`
        relative flex flex-col items-center justify-center 
        aspect-video rounded-lg border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground hover:bg-muted/50"}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" accept="image/*" onChange={handleFileSelect} className="sr-only" />
      <Upload className={`size-10 mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
      <p className="text-sm font-medium">{isDragging ? "Drop your image here" : "Drag & drop or click to upload"}</p>
      <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, WEBP, GIF</p>
    </label>
  )
}
