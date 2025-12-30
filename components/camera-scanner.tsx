import React, { useRef, useEffect } from "react"

interface CameraScannerProps {
  onCapture: (imageDataUrl: string) => void
  label?: string
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, label = "Scan with Camera" }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
        }
      } catch (err) {
        // Handle error (permission denied, no camera, etc)
      }
    })()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleCapture = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      onCapture(canvas.toDataURL("image/png"))
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <video ref={videoRef} autoPlay playsInline className="rounded border border-border w-full max-w-xs aspect-video bg-black" />
      <button type="button" className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground" onClick={handleCapture}>
        {label}
      </button>
    </div>
  )
}
