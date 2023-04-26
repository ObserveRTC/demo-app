import { W3CStats, InboundRtpEntry } from "@observertc/client-monitor-js";
import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useMediaServiceContext } from "../../contexts/MediaServiceContext";
import { useAppSelector } from "../../store/hooks";
import StatsCard from "./StatsCard";

export interface MySandboxProps {
}

const MySandbox: React.FC<MySandboxProps> = () => {
	const mediaService = useMediaServiceContext();
	const [myStats, setMyStats] = React.useState<any>({});
  	useEffect(() => {
		if (!mediaService) {
			return;
		}
		// access to the monitor and storage
		const monitor = mediaService.monitor;
		const storage = monitor.storage;

		// Create a listener subscribing to the event of collected stats
		const listener = () => {
			// Access to the structurized stats through storage:
			for (const inboundRtp of Array.from(storage.inboundRtps())) {
				const remoteOutboundRtp = inboundRtp.getRemoteOutboundRtp();
			}

			// or use updates properties
			setMyStats({
				outbPackets: storage.updates.totalOutboundPacketsSent,
			});
			// console.log({
			// 	outbPackets: storage.updates.totalOutboundPacketsSent,
			// });
		};
		mediaService.monitor.on('stats-collected', listener);
		return () => {
			mediaService.monitor.off('stats-collected', listener);
		};
	  }, [mediaService]);
	  return (
		<Container>
			<p>number of outbound packets: {myStats.outbPackets}</p>
	  	</Container>
	  )
};

export default MySandbox;