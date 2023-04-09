import React, { useEffect } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { InboundRtpEntry, RemoteOutboundRtpEntry, W3CStats } from '@observertc/client-monitor-js';
import { useMediaServiceContext } from '../../contexts/MediaServiceContext';
import StatsCard from './StatsCard';
import { useAppSelector } from '../../store/hooks';

export interface RemoteClientStatsProps {
	clientId: string,
}

const RemoteClientsStats: React.FC<RemoteClientStatsProps> = ({ clientId }) => {
	const mediaService = useMediaServiceContext();
	const remoteClient = useAppSelector(state => state.remoteClients.clients).find(c => c.clientId === clientId);
	const [inboundRtps, setInboundRtps] = React.useState<W3CStats.RtcInboundRtpStreamStats[]>([]);
	const [remoteOutboundRtps, setRemoteOutboundRtps] = React.useState<W3CStats.RtcRemoteOutboundRTPStreamStats[]>([]);
  	useEffect(() => {
		if (!mediaService) {
			return;
		}
		const storage = mediaService.monitor.storage;
		const listener = () => {
			const rtcInboundRtps: W3CStats.RtcInboundRtpStreamStats[] = [];
			const rtcRemoteOutboundRtps: W3CStats.RtcRemoteOutboundRTPStreamStats[] = [];
			for (const remoteOutboundRtp of Array.from(storage.remoteOutboundRtps())) {
				// if (
				// 	remoteOutboundRtp.getInboundRtp()?.getTrackId() === undefined || 
				// 	remoteOutboundRtp.getInboundRtp()?.getTrackId() === remoteClient?.audioTrackId || 
				// 	remoteOutboundRtp.getInboundRtp()?.getTrackId() === remoteClient?.videoTrackId
				// ) {
				// 	rtcRemoteOutboundRtps.push(remoteOutboundRtp.stats);
				// }
				// rtcRemoteOutboundRtps.push(remoteOutboundRtp.stats);
			}
			for (const inboundRtp of Array.from(storage.inboundRtps())) {
				if (
					remoteClient?.audioTrackId !== inboundRtp.getTrackId() &&
					remoteClient?.videoTrackId !== inboundRtp.getTrackId()
				) {
					continue;
				}
				const remoteOutboundRtp = inboundRtp.getRemoteOutboundRtp();
				if (remoteOutboundRtp) {
					rtcRemoteOutboundRtps.push(remoteOutboundRtp.stats);
				}
				// outbounRtp.stats.qualityLimitationDurations
				const obj: any = {
				};
				// for (const [key, value] of Object.entries(outbounRtp.stats.qualityLimitationDurations ?? {})) {
				// 	obj[`qualityLimitationDurations-${key}`] = value;
				// }
				// for (const [key, value] of Object.entries(outbounRtp.stats.qualityLimitationReason ?? {})) {
				// 	obj[`qualityLimitationReason-${key}`] = value;
				// }
				// for (const [key, value] of Object.entries(outbounRtp.stats.qualityLimitationResolutionChanges ?? {})) {
				// 	obj[`qualityLimitationResolutionChanges-${key}`] = value;
				// }
				// const durations = Object.entries(outbounRtp.stats.qualityLimitationDurations ?? {}).map(([key, value]) => )
				rtcInboundRtps.push({
					...inboundRtp.stats,
					// qualityLimitationResolutionChanges: undefined,
					// qualityLimitationDurations: undefined,
					// qualityLimitationReason: undefined,
					...obj,
				});
			}
			// for (const remoteInboundRtp of Array.from(storage.remoteInboundRtps())) {
			// 	rtcRemoteInboundRtps.push(remoteInboundRtp.stats);
			// }
			setInboundRtps(rtcInboundRtps);
			setRemoteOutboundRtps(rtcRemoteOutboundRtps);
		};
		mediaService.monitor.on('stats-collected', listener);
		return () => {
			mediaService.monitor.off('stats-collected', listener);
		};
	  }, [remoteClient]);
	  return (
		<Container>
			<br />
			<Row>
				<Col width="50%">
					<StatsCard stats={inboundRtps} title="Inbound Rtp" />
					<br />
				</Col>
				<Col width="50%">
					<StatsCard stats={remoteOutboundRtps} title="Remote Outbound Rtp" />
					{/* <StatsCard stats={remoteInboundRtps} title="Remote Outbound Rtp" /> */}
					<br />
					{/* <StatsCard stats={pcStats} title="PeerConnections" /> */}
				</Col>
			</Row>
	  	</Container>
	  )
};

export default RemoteClientsStats;
