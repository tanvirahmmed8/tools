import React, { useRef, useEffect, useState } from "react"

interface CameraScannerProps {
  onCapture: (imageDataUrl: string) => void
  label?: string
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, label = "Scan with Camera" }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const [cameraOn, setCameraOn] = useState(false)
	const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
	const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cameraOn) return;
    setLoading(true);
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        // Handle error (permission denied, no camera, etc)
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraOn, facingMode]);

  const handleOpenCamera = () => setCameraOn(true)
  const handleCloseCamera = () => setCameraOn(false)
  const handleSwitchCamera = () => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))

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
    handleCloseCamera()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {!cameraOn ? (
        <button
          type="button"
          className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground"
          onClick={handleOpenCamera}
        >
          {label}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded border border-border w-full max-w-xs aspect-video bg-black"
            style={{ display: loading ? 'none' : undefined }}
          />
          {loading && <div className="text-xs text-muted-foreground">Loading camera...</div>}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
              onClick={handleCapture}
            >
              Capture
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-muted text-foreground border"
              onClick={handleCloseCamera}
            >
              Close
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-secondary text-foreground border"
              onClick={handleSwitchCamera}
            >
              Switch Camera
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
