"use client"
import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export function useMediaPipe() {
    const [isLoaded, setIsLoaded] = useState(false)
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)

    useEffect(() => {
        async function init() {
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            )
            const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numFaces: 1
            })
            faceLandmarkerRef.current = landmarker
            setIsLoaded(true)
        }
        init()
    }, [])

    const detect = (videoElement: HTMLVideoElement) => {
        if (!faceLandmarkerRef.current || !videoElement.videoWidth) return null
        const startTimeMs = performance.now()
        const results = faceLandmarkerRef.current.detectForVideo(videoElement, startTimeMs)
        return results
    }

    return { isLoaded, detect }
}
