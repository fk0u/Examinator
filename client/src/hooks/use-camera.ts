import { $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { cheatLogsApi } from "~/lib/api";

export function useCamera(attemptIdSignal: any) {
  const stream = useSignal<MediaStream | null>(null);
  const videoRef = useSignal<HTMLVideoElement | null>(null);
  const cameraEnabled = useSignal(false);
  const micEnabled = useSignal(false);
  const audioLevel = useSignal(0);
  const isRequesting = useSignal(false);
  const error = useSignal<string | null>(null);
  const audioContextRef = useSignal<AudioContext | null>(null);
  const animationIdRef = useSignal<number | null>(null);

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (animationIdRef.value) cancelAnimationFrame(animationIdRef.value);
      if (audioContextRef.value) audioContextRef.value.close();
      if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop());
      }
    });
  });

  const requestPermission = $(async () => {
    if (isRequesting.value) return;
    isRequesting.value = true;
    error.value = null;
    
    console.log("[useCamera] Requesting getUserMedia...");
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("API media tidak didukung di browser ini (pastikan gunakan HTTPS)");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      
      console.log("[useCamera] getUserMedia success, tracks:", mediaStream.getTracks().length);
      
      // Update basic signals
      const hasVideo = mediaStream.getVideoTracks().length > 0;
      const hasAudio = mediaStream.getAudioTracks().length > 0;
      
      cameraEnabled.value = hasVideo;
      micEnabled.value = hasAudio;
      stream.value = mediaStream;

      // Internal video for capturePhoto (hidden)
      const internalVideo = document.createElement("video");
      internalVideo.setAttribute("playsinline", "true");
      internalVideo.muted = true;
      internalVideo.srcObject = mediaStream;
      await internalVideo.play().catch(e => console.warn("[useCamera] Internal video play delayed:", e));
      videoRef.value = internalVideo;

      // Audio Level Monitoring
      if (hasAudio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.value = audioContext;
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          audioLevel.value = Math.min(100, Math.round((average / 60) * 100));
          animationIdRef.value = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }
      
      return true;
    } catch (e: any) {
      console.error("[useCamera] Error:", e);
      error.value = e.message || String(e);
      cameraEnabled.value = false;
      micEnabled.value = false;
      return false;
    } finally {
      isRequesting.value = false;
    }
  });

  const capturePhoto = $(async (cheatType: string, description: string) => {
    if (!videoRef.value || !cameraEnabled.value) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.value.videoWidth || 640;
      canvas.height = videoRef.value.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        if (!blob || !attemptIdSignal.value?.id) return;
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
      console.error("[useCamera] Capture failed:", e);
    }
  });

  return { cameraEnabled, micEnabled, audioLevel, capturePhoto, stream, requestPermission, isRequesting, error };
}
