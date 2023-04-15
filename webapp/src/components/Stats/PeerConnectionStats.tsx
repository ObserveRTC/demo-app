import React, { useEffect } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { PeerConnectionEntry, W3CStats } from '@observertc/client-monitor-js';
import { useMediaServiceContext } from '../../contexts/MediaServiceContext';
import StatsCard from './StatsCard';
import { useAppSelector } from '../../store/hooks';
import { makePrefixedObj } from '../../utils/common';


const PeerConnectionStats: React.FC = () => {
	const mediaService = useMediaServiceContext();
	const [pcStats, setPcStats] = React.useState<W3CStats.RtcPeerConnectionStats[]>([]);
	const [transportStats, setTransportStats] = React.useState<W3CStats.RtcTransportStats[]>([]);
	const [audioSources, setAudioSources] = React.useState<W3CStats.RtcAudioSourceStats[]>([]);
	const [videoSources, setVideoSources] = React.useState<W3CStats.RtcVideoSourceStats[]>([]);
	const [audioPlayouts, setAudioPlayouts] = React.useState<W3CStats.RTCAudioPlayoutStats[]>([]);
	const [senders, setSenders] = React.useState<W3CStats.RtcSenderCompoundStats[]>([]);
	const [receivers, setReceivers] = React.useState<W3CStats.RtcReceiverCompoundStats[]>([]);

  	useEffect(() => {
		if (!mediaService) {
		return;
		}
		const storage = mediaService.monitor.storage;
		const listener = () => {
			const pcs: (W3CStats.RtcPeerConnectionStats & PeerConnectionEntry['updates'])[] = [];
			const transports: W3CStats.RtcTransportStats[] = [];
			const rtcAudioSources: W3CStats.RtcAudioSourceStats[] = [];
			const rtcVideoSources: W3CStats.RtcVideoSourceStats[] = [];
			const rtcAudioPlayouts: W3CStats.RTCAudioPlayoutStats[] = [];
			const rtcSenders: W3CStats.RtcSenderCompoundStats[] = [];
			const rtcReceivers: W3CStats.RtcReceiverCompoundStats[] = [];
			for (const peerConnection of Array.from(storage.peerConnections())) {
				if (peerConnection.stats) {
					pcs.push({
						...peerConnection.stats,
						...makePrefixedObj(peerConnection.updates, 'updates-'),
						id: peerConnection.label ?? peerConnection.id,
					});
					console.warn("(peerConnection.updates", peerConnection.updates);
				}
				for (const transport of Array.from(peerConnection.transports())) {
					if (peerConnection.stats) {
						transports.push({
							...transport.stats,
							id: peerConnection.label ?? peerConnection.id
						})
					}
				}
				for (const mediaSource of Array.from(peerConnection.mediaSources())) {
					if (mediaSource.stats.kind === 'audio') {
						rtcAudioSources.push(mediaSource.stats);
					} else {
						rtcVideoSources.push(mediaSource.stats as W3CStats.RtcVideoSourceStats);
					}
				}
				
				for (const audioPlayout of Array.from(peerConnection.audioPlayouts())) {
					rtcAudioPlayouts.push(audioPlayout.stats);
				}

				for (const sender of Array.from(peerConnection.senders())) {
					rtcSenders.push(sender.stats);
				}

				for (const receiver of Array.from(peerConnection.receivers())) {
					rtcReceivers.push(receiver.stats);
				}
			}
			setPcStats(pcs);
			setTransportStats(transports);
			setAudioSources(rtcAudioSources);
			setVideoSources(rtcVideoSources);
			setAudioPlayouts(rtcAudioPlayouts);
			setSenders(rtcSenders);
			setReceivers(rtcReceivers);
		};
		mediaService.monitor.on('stats-collected', listener);
		return () => {
			mediaService.monitor.off('stats-collected', listener);
		};
	  }, [mediaService]);
	  return (
		<Container>
			<br />
			<Row>
				<Col width="50%">
					<StatsCard stats={pcStats} title="Peer Connections" />
					<br />
					<StatsCard stats={transportStats} title="Transports" />
				</Col>
				<Col width="50%">
					<StatsCard stats={audioSources} title="Audio Sources" />
					<br />
					<StatsCard stats={videoSources} title="Video Sources" />
					<br />
					<StatsCard stats={audioPlayouts} title="Audio Playouts" />
					<br />
					<StatsCard stats={senders} title="Senders" />
					<br />
					<StatsCard stats={receivers} title="Receivers" />
					<br />
					{/* <StatsCard stats={pcStats} title="PeerConnections" /> */}
				</Col>
			</Row>
	  	</Container>
	  )
};

export default PeerConnectionStats;
