import { useEffect, useState } from "react";
import Webcam from "react-webcam";

export default function CameraWithPinchZoom({ webcamRef }) {
  const [track, setTrack] = useState(null);
  const [baseDistance, setBaseDistance] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  useEffect(() => {
    if (webcamRef.current?.stream) {
      const t = webcamRef.current.stream.getVideoTracks()[0];
      setTrack(t);
    }
  }, [webcamRef, webcamRef.current?.stream]);

  const getDistance = (touches) => {
    const [a, b] = touches;
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setBaseDistance(getDistance(e.touches));
    }
  };

  const handleTouchMove = async (e) => {
    if (e.touches.length === 2 && track) {
      const newDistance = getDistance(e.touches);
      if (baseDistance) {
        const scale = newDistance / baseDistance;
        let newZoom = Math.min(Math.max(currentZoom * scale, 1), 5); // batas zoom 1x–5x
        setCurrentZoom(newZoom);

        try {
          await track.applyConstraints({
            advanced: [{ zoom: newZoom }],
          });
        } catch (err) {
          console.warn("Zoom not supported on this device", err);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setBaseDistance(null);
  };

  return (
    <div
      className="relative w-full h-[400px]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover rounded-md bg-black"
        videoConstraints={{
          facingMode: { ideal: "environment" },
        }}
      />
    </div>
  );
}
