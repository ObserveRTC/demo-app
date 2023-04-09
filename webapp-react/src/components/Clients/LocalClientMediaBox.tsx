import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useMediaServiceContext } from '../../contexts/MediaServiceContext';
import { useAppSelector } from '../../store/hooks';
import { createLogger } from '../../utils/logger';

const logger = createLogger('VideoComponent');

interface VideoComponentProps {
}

const LocalClientMediaBox: React.FC<VideoComponentProps> = () => {
  const localClient = useAppSelector(state => state.localClient);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const [audioTrack, setAudioTrack] = React.useState<MediaStreamTrack | null>(null);
  const [videoTrack, setVideoTrack] = React.useState<MediaStreamTrack | null>(null);
  const mediaService = useMediaServiceContext();
  const webcamRef = useRef<Webcam | null>(null);

  useEffect(() => {
    if (!mediaService) {
      return;
    }
    const getMedia = async () => {

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (webcamRef.current) {
          webcamRef.current.video!.srcObject = stream;
        }
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        const streamAudioTrack = 0 < audioTracks.length ? audioTracks[0] : null;
        const streamVideoTrack = 0 < videoTracks.length ? videoTracks[0] : null;
        await Promise.all([
          streamAudioTrack ? mediaService.produceMedia(streamAudioTrack) : Promise.resolve(),
          streamVideoTrack ? mediaService.produceMedia(streamVideoTrack) : Promise.resolve(),
        ]);
        setAudioTrack(streamAudioTrack);
        setVideoTrack(streamVideoTrack);

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
  }, [mediaService]);


  const playMic = () => {
    if (!mediaService) {
      logger.warn(`No mediaService for playMic operation`);
      return;
    }
    if (!audioTrack) {
      logger.warn(`No Audio track to play`);
      return;
    }
    mediaService.resumeMedia(audioTrack);
	  setIsMuted(false);
  };
  const pauseMic = () => {
    if (!mediaService) {
      logger.warn(`No mediaService for pauseMic operation`);
      return;
    }
    if (!audioTrack) {
      logger.warn(`No Audio track to pause`);
      return;
    }
    mediaService.pauseMedia(audioTrack);
    setIsMuted(true);
  };

  const playCam = () => {
    if (!mediaService) {
      logger.warn(`No mediaService for playCam operation`);
      return;
    }
    if (!videoTrack) {
      logger.warn(`No video track to play`);
      return;
    }
    mediaService.resumeMedia(videoTrack);
    setIsPaused(false);
  };
  const pauseCam = () => {
    if (!mediaService) {
      logger.warn(`No mediaService for pauseCam operation`);
      return;
    }
    if (!videoTrack) {
      logger.warn(`No video track to pause`);
      return;
    }
    mediaService.pauseMedia(videoTrack);
    setIsPaused(true);
  }

  return (
    <div>
      <p style={{ color: "#fff" }}> {localClient.userId}</p>
      <Webcam
        ref={webcamRef}
        audio={true}
        videoConstraints={{
          facingMode: 'user',
        }}
        style={{
          width: '200px',
          height: 'auto',
        }}
      />
      <div>
        <button onClick={isMuted ? playMic : pauseMic}>{isMuted ? 'UnMute' : 'Mute'}</button>
        <button onClick={isPaused ? playCam : pauseCam}>{isPaused ? 'Play' : 'Pause'}</button>
      </div>
    </div>
  );
};


export default LocalClientMediaBox;
