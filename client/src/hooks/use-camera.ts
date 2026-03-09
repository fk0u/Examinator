import { $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { cheatLogsApi } from "~/lib/api";

export function useCamera(attemptIdSignal: any) {
  const stream = useSignal<MediaStream | null>(null);
  const videoRef = useSignal<HTMLVideoElement | null>(null);
  const cameraEnabled = useSignal(false);

  useVisibleTask$(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.value = mediaStream;
      cameraEnabled.value = true;
      
      const video = document.createElement("video");
      video.srcObject = mediaStream;
      video.play();
      videoRef.value = video;
    } catch (e) {
      console.error("Camera permission denied:", e);
      cameraEnabled.value = false;
    }

    return () => {
      if (stream.value) {
        stream.value.getTracks().forEach((track) => track.stop());
      }
    };
  });

  const capturePhoto = $(async (cheatType: string, description: string) => {
    if (!videoRef.value || !attemptIdSignal.value || !cameraEnabled.value) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.value.videoWidth || 640;
      canvas.height = videoRef.value.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        const formData = new FormData();
        
        formData.append("attemptId", attemptIdSignal.value.id);
        formData.append("cheatType", cheatType);
        formData.append("captureType", "photo");
        formData.append("description", description);
        formData.append("file", file);
        
        await cheatLogsApi.capture(formData);
      }, "image/jpeg", 0.7);
    } catch (e) {
      console.error("Failed to capture photo:", e);
    }
  });

  return { cameraEnabled, capturePhoto };
}
