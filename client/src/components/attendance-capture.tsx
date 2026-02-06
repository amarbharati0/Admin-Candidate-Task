import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, MapPin, Smartphone, Globe } from "lucide-react";
import { useMarkAttendance } from "@/hooks/use-attendance";
import { useToast } from "@/hooks/use-toast";

interface AttendanceCaptureProps {
  taskId?: number;
  onSuccess?: () => void;
}

export function AttendanceCapture({ taskId, onSuccess }: AttendanceCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markAttendance = useMarkAttendance();
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Please allow camera access to mark attendance.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;

    try {
      // Get Geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const blob = await (await fetch(capturedImage)).blob();
      const formData = new FormData();
      formData.append("photo", blob, "attendance.jpg");
      formData.append("latitude", position.coords.latitude.toString());
      formData.append("longitude", position.coords.longitude.toString());
      if (taskId) formData.append("taskId", taskId.toString());

      await markAttendance.mutateAsync(formData);
      setCapturedImage(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to get location or upload attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Mark Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {isCapturing ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Camera is off</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2">
          {!isCapturing && !capturedImage && (
            <Button onClick={startCamera} className="w-full gap-2">
              <Camera className="h-4 w-4" /> Start Camera
            </Button>
          )}
          {isCapturing && (
            <Button onClick={capturePhoto} className="w-full gap-2" variant="secondary">
              <Camera className="h-4 w-4" /> Capture Photo
            </Button>
          )}
          {capturedImage && (
            <>
              <Button onClick={() => setCapturedImage(null)} variant="outline" className="flex-1">
                Retake
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1" 
                disabled={markAttendance.isPending}
              >
                {markAttendance.isPending ? "Submitting..." : "Submit"}
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> Geolocation
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" /> IP Address
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-3 w-3" /> Device Details
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> Timestamp
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
