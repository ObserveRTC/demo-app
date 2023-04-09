import React, { useEffect } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { OutboundRtpEntry, W3CStats } from '@observertc/client-monitor-js';
import { useMediaServiceContext } from '../../contexts/MediaServiceContext';
import StatsCard from './StatsCard';
import { makePrefixedObj } from '../../utils/common';


const LocalCLientsStats: React.FC = () => {
	const mediaService = useMediaServiceContext();
	const [outboundRtps, setOutboundRtps] = React.useState<W3CStats.RtcOutboundRTPStreamStats[]>([]);
	const [remoteInboundRtps, setRemoteInboundRtps] = React.useState<W3CStats.RtcRemoteInboundRtpStreamStats[]>([]);

  	useEffect(() => {
		if (!mediaService) {
		return;
		}
		const storage = mediaService.monitor.storage;
		const listener = () => {
			const rtcOutboundRtps: (W3CStats.RtcOutboundRTPStreamStats & OutboundRtpEntry['updates'])[] = [];
			const rtcRemoteInboundRtps: W3CStats.RtcRemoteInboundRtpStreamStats[] = [];
			for (const outboundRtp of Array.from(storage.outboundRtps())) {
				// outbounRtp.stats.qualityLimitationDurations
				const obj: any = {
				};
				for (const [key, value] of Object.entries(outboundRtp.stats.qualityLimitationDurations ?? {})) {
					obj[`qualityLimitationDurations-${key}`] = value;
				}
				for (const [key, value] of Object.entries(outboundRtp.stats.qualityLimitationResolutionChanges ?? {})) {
					obj[`qualityLimitationResolutionChanges-${key}`] = value;
				}
				// const durations = Object.entries(outbounRtp.stats.qualityLimitationDurations ?? {}).map(([key, value]) => )
				rtcOutboundRtps.push({
					...outboundRtp.stats,
					...makePrefixedObj(outboundRtp.updates, 'updates-'),
					qualityLimitationResolutionChanges: undefined,
					qualityLimitationDurations: undefined,
					...obj,
				});
			}
			for (const remoteInboundRtp of Array.from(storage.remoteInboundRtps())) {
				rtcRemoteInboundRtps.push(remoteInboundRtp.stats);
			}
			setOutboundRtps(rtcOutboundRtps);
			setRemoteInboundRtps(rtcRemoteInboundRtps);
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
					<StatsCard stats={outboundRtps} title="Outbound Rtp" />
					<br />
				</Col>
				<Col width="50%">
					<StatsCard stats={remoteInboundRtps} title="Remote Inbound Rtp" />
					<br />
					{/* <StatsCard stats={pcStats} title="PeerConnections" /> */}
				</Col>
			</Row>
	  	</Container>
	  )
};

export default LocalCLientsStats;
