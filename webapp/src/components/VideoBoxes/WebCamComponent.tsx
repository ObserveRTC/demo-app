// WebcamComponent.tsx
import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const WebcamComponent: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (webcamRef.current) {
          webcamRef.current.video!.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    getMedia();

    return () => {
      if (webcamRef.current && webcamRef.current.video!.srcObject) {
        const tracks = (webcamRef.current.video!.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        audio={true}
        videoConstraints={{
          facingMode: 'user',
        }}
        style={{
          width: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
};

export default WebcamComponent;
