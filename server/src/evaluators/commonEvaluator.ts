import { CallEventReport, EvaluatorProcess, SfuEventReport } from "@observertc/observer-js";
import { observer } from "mediasoup";
import Prometheus from 'prom-client';
import { createLogger } from "../logger";

const logger = createLogger('CommonEvaluator');

export function createCommonEvaluator(registry: Prometheus.Registry): EvaluatorProcess {

	const addedInboundAudioTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'added_inbound_audio_track_ids',
		help: 'The number of added inbound audio tracks',
	});
	
	const addedInboundVideoTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'added_inbound_video_track_ids',
		help: 'The number of added inbound video tracks',
	});
	
	const addedOutboundAudioTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'added_outbound_audio_track_ids',
		help: 'The number of added outbound audio tracks',
	});
	
	const addedOutboundVideoTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'added_outbound_video_track_ids',
		help: 'The number of added outbound video tracks',
	});
	
	const openedPeerConnectionIds = new Prometheus.Counter({
		registers: [registry],
		name: 'opened_peer_connection_ids',
		help: 'The number of opened peer connections',
	});
	
	const joinedClientIds = new Prometheus.Counter({
		registers: [registry],
		name: 'joined_client_ids',
		help: 'The number of clients that have joined',
	});
	
	const startedCallIds = new Prometheus.Counter({
		registers: [registry],
		name: 'started_call_ids',
		help: 'The number of started calls',
	});
	
	const addedSfuInbounRtpPadIds = new Prometheus.Counter({
		registers: [registry],
		name: 'added_sfu_inbound_rtp_pad_ids',
		help: 'The number of added SFU inbound RTP pads',
	});
	
	const addedSfuOutbounRtpPadIds = new Prometheus.Counter({
		registers: [registry],
		name: 'added_sfu_outbound_rtp_pad_ids',
		help: 'The number of added SFU outbound RTP pads',
	});
	
	const openedSfuSctpChannelIds = new Prometheus.Counter({
		registers: [registry],
		name: 'opened_sfu_sctp_channel_ids',
		help: 'The number of opened SFU SCTP channels',
	});
	
	const openedSfuTransportIds = new Prometheus.Counter({
		registers: [registry],
		name: 'opened_sfu_transport_ids',
		help: 'The number of opened SFU transports',
	});
	
	const removedInboundAudioTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'removed_inbound_audio_track_ids',
		help: 'The number of removed inbound audio tracks',
	});
	
	const removedInboundVideoTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'removed_inbound_video_track_ids',
		help: 'The number of removed inbound video tracks',
	});
	
	const removedOutboundAudioTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'removed_outbound_audio_track_ids',
		help: 'The number of removed outbound audio tracks',
	});
	
	const removedOutboundVideoTrackIds = new Prometheus.Counter({
		registers: [registry],
		name: 'removed_outbound_video_track_ids',
		help: 'The number of removed outbound video tracks',
	});
	
	const closedPeerConnectionIds = new Prometheus.Counter({
		registers: [registry],
		name: 'closed_peer_connection_ids',
		help: 'The number of closed peer connections',
	});
	
	const detachedClientIds = new Prometheus.Counter({
		registers: [registry],
		name: 'detached_client_ids',
		help: 'The number of detached clients',
	});
	
	const endedCallIds = new Prometheus.Counter({
		registers: [registry],
		name: 'ended_call_ids',
		help: 'The number of ended calls',
	});
	
	const removedSfuInboundRtpPadIds = new Prometheus.Counter({
		registers: [registry],
		name: 'removed_sfu_inbound_rtp_pad_ids',
		help: 'The number of removed SFU inbound RTP pads',
	});
	
	const removedSfuOutboundRtpPadIds = new Prometheus.Counter({
		registers: [registry],
		name: 'removed_sfu_outbound_rtp_pad_ids',
		help: 'The number of removed SFU outbound RTP pads',
	});
	
	const closedSfuSctpChannelIds = new Prometheus.Counter({
		registers: [registry],
		name: 'closed_sfu_sctp_channel_ids',
		help: 'The number of closed SFU SCTP channels',
	});
	
	const closedSfuTransportIds = new Prometheus.Counter({
		registers: [registry],
		name: 'closed_sfu_transport_ids',
		help: 'The number of closed SFU transports',
	});
	
	return async (context) => {

		addedInboundAudioTrackIds.inc(context.addedInboundAudioTrackIds.length);
		addedInboundVideoTrackIds.inc(context.addedInboundVideoTrackIds.length);
		addedOutboundAudioTrackIds.inc(context.addedOutboundAudioTrackIds.length);
		addedOutboundVideoTrackIds.inc(context.addedOutboundVideoTrackIds.length);
		openedPeerConnectionIds.inc(context.openedPeerConnectionIds.length);
		joinedClientIds.inc(context.joinedClientIds.length);
		startedCallIds.inc(context.startedCallIds.length);
		addedSfuInbounRtpPadIds.inc(context.addedSfuInbounRtpPadIds.length);
		addedSfuOutbounRtpPadIds.inc(context.addedSfuOutbounRtpPadIds.length);
		openedSfuSctpChannelIds.inc(context.openedSfuSctpChannelIds.length);
		openedSfuTransportIds.inc(context.openedSfuTransportIds.length);

		removedInboundAudioTrackIds.inc(context.removedInboundAudioTracks.length);
		removedInboundVideoTrackIds.inc(context.removedInboundVideoTracks.length);
		removedOutboundAudioTrackIds.inc(context.removedOutboundAudioTracks.length);
		removedOutboundVideoTrackIds.inc(context.removedOutboundVideoTracks.length);
		closedPeerConnectionIds.inc(context.closedPeerConnections.length);
		detachedClientIds.inc(context.detachedClients.length);
		endedCallIds.inc(context.endedCalls.length);
		removedSfuInboundRtpPadIds.inc(context.removedSfuInbounRtpPadIds.length);
		removedSfuOutboundRtpPadIds.inc(context.removedSfuOutbounRtpPadIds.length);
		closedSfuSctpChannelIds.inc(context.closedSfuSctpChannels.length);
		closedSfuTransportIds.inc(context.closedSfuTransports.length);
	}
}