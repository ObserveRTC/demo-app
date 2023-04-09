import React, { useRef, useEffect } from 'react';
import './MediaStreamBox.css'

export type RemoteClientProps = {
  stream: MediaStream,
  userId?: string,
}

const MediaStreamBox: React.FC<RemoteClientProps> = ({ stream: mediaStream, userId }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [mediaStream]);

  return (
      <div>
        <p style={{ color: "#fff" }}>{userId}</p>
        <video className="w-100 h-auto"
          // className="rounded-video"
          ref={videoRef}
          // width="100px"
          // height="auto"
          autoPlay
          playsInline
          muted
          controls={false}
        ></video>
      </div>
        
      
  );
};

export default MediaStreamBox;
