import React, { useRef, useEffect, useCallback } from 'react';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import { MediaServiceEvents } from '../../contexts/MediaService';
import { useMediaServiceContext } from '../../contexts/MediaServiceContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { remoteClientsActions } from '../../store/remoteClientsSlice';
import { createLogger } from '../../utils/logger';
import MediaStreamBox from '../VideoBoxes/MediaStreamBox';
import "./RemoteClients.css"

const logger = createLogger('RemoteClients');

type RemoteClientInfo = {
  mediaStream: MediaStream,
  userId?: string,
}

const remoteClientInfo: Map<string,RemoteClientInfo> = new Map<string, RemoteClientInfo>(); // not elegant, but at this point, I don't care!

const RemoteClients: React.FC = () => {
  const mediaService = useMediaServiceContext();
  const [mediaStreams, setMediaStreams] = React.useState<RemoteClientInfo[]>([]);
  const remoteClients = useAppSelector(state => state.remoteClients.clients);
  const dispatch = useAppDispatch();

  const addedMediaConsumer = useCallback((event: MediaServiceEvents['addedMediaConsumer']) => {
      const { remoteClientId, track, userId } = event;
      let remoteClient = remoteClients.find(c => c.clientId === remoteClientId);
      let { mediaStream } = remoteClientInfo.get(remoteClientId) ?? {};
      if (!remoteClient) {
        remoteClient = {
          clientId: remoteClientId,
          userId,
        };
        dispatch(remoteClientsActions.add(remoteClient));
      }
      if (!mediaStream) {
        mediaStream = new MediaStream();
        remoteClientInfo.set(remoteClientId, {
          mediaStream,
          userId
        });
        setMediaStreams(Array.from(remoteClientInfo.values()));
      }
      mediaStream.addTrack(track);
      if (track.kind === 'audio') {
        dispatch(remoteClientsActions.setAudioTrackId({
          clientId: remoteClientId,
          trackId: track.id
        }));
      } else {
        dispatch(remoteClientsActions.setVideoTrackId({
          clientId: remoteClientId,
          trackId: track.id
        }));
      }
  }, [mediaStreams]);

  const removedMediaConsumer = useCallback((event: MediaServiceEvents['removedMediaConsumer']) => {
    const { trackId } = event;
    for (const [remoteClientId, { mediaStream }] of Array.from(remoteClientInfo.entries())) {
      const track = mediaStream.getTracks().find(t => t.id === trackId);
      if (!track) {
        continue;
      }
      if (track.kind === 'audio') {
        dispatch(remoteClientsActions.setAudioTrackId({
          clientId: remoteClientId,
          trackId: undefined
        }));
      } else {
        dispatch(remoteClientsActions.setVideoTrackId({
          clientId: remoteClientId,
          trackId: undefined
        }));
      }
      mediaStream.removeTrack(track);
      if (0 < mediaStream.getTracks().length) {
        return;
      }
      
      remoteClientInfo.delete(remoteClientId);
      setMediaStreams(Array.from(remoteClientInfo.values()));
      dispatch(remoteClientsActions.remove(remoteClientId));
    }
}, [mediaStreams]);

  useEffect(() => {
    if (!mediaService) {
      return;
    }
    mediaService.on('addedMediaConsumer', addedMediaConsumer);
    mediaService.on('removedMediaConsumer', removedMediaConsumer);
    return () => {
      mediaService.off('addedMediaConsumer', addedMediaConsumer);
      mediaService.off('removedMediaConsumer', removedMediaConsumer);
    };
  }, [mediaService]);

  const colWidth = 12 / mediaStreams.length;
  return (
    <Container fluid>
      <Row>
        {Array.from(mediaStreams).map(({ mediaStream, userId }, index) => {
          return (
            <Col key={index} xs={12} md={colWidth}>
              {/* <video className="w-100 h-auto" src={videoSrc} controls /> */}
              <MediaStreamBox stream={mediaStream} userId={userId}/>
            </Col>
          )
        })}
      </Row>
    </Container>
  );
};

export default RemoteClients;
