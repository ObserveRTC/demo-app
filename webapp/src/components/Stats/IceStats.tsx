import React, { useCallback, useEffect } from 'react';
import { Button, Card, Container, Row, Tab, Table, Tabs, Col } from 'react-bootstrap';
import { W3CStats } from '@observertc/client-monitor-js';
import { useMediaServiceContext } from '../../contexts/MediaServiceContext';
import StatsCard from './StatsCard';


const IceCandidatePairStatsTable: React.FC = () => {
	const mediaService = useMediaServiceContext();
	const [candidatePairs, setCandidatePairs] = React.useState<W3CStats.RtcIceCandidatePairStats[]>([]);
	const [localCandidates, setLocalCandiadtes] = React.useState<W3CStats.RtcLocalCandidateStats[]>([]);
	const [remoteCandidates, setRemoteCandiadtes] = React.useState<W3CStats.RtcRemoteCandidateStats[]>([]);

  	useEffect(() => {
		if (!mediaService) {
		return;
		}
		const storage = mediaService.monitor.storage;
		const listener = () => {
			// console.warn(`sadsad`, stats);
			const pairs: W3CStats.RtcIceCandidatePairStats[] = [];
			for (const iceCandidatePair of Array.from(storage.iceCandidatePairs())) {
				pairs.push(
					iceCandidatePair.stats ?? {}
				);
			}
			setCandidatePairs(pairs);

			const locals: W3CStats.RtcLocalCandidateStats[] = [];
			for (const localCandidate of Array.from(storage.localCandidates())) {
				locals.push(
					localCandidate.stats ?? {}
				);
			}
			setLocalCandiadtes(locals);

			const remotes: W3CStats.RtcRemoteCandidateStats[] = [];
			for (const remoteCandidate of Array.from(storage.remoteCandidates())) {
				remotes.push(
					remoteCandidate.stats ?? {}
				);
			}
			setRemoteCandiadtes(remotes);
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
					<StatsCard stats={candidatePairs} title="ICE Candidate Pairs" />
					<br />
				</Col>
			<Col>
				<br />
				<StatsCard stats={localCandidates} title="Local Candidates" />
				<br />
				<StatsCard stats={remoteCandidates} title="Remote Candidates" />
				<br />
			</Col>
			</Row>
	  	</Container>
	  )
};

export default IceCandidatePairStatsTable;
