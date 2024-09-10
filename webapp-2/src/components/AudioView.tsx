// import { onMount, useContext } from 'solid-js';

// interface AudioViewProps {
// 	consumer: StateConsumer;
// }

// const AudioView = (props: AudioViewProps): JSX.Element => {
// 	const { liveCall } = useContext(ServiceContext);
// 	const audioElement = useRef<HTMLAudioElement>(null);

// 	onMount(() => {
// 		const { track } = liveCall.getMediaConsumer(props.consumer.id) ?? {};

// 		if (!track || !audioElement?.current) return;

// 		const { audioGain } = props.consumer;

// 		if (audioGain !== undefined)
// 			audioElement.current.volume = audioGain;

// 		const stream = new MediaStream();

// 		stream.addTrack(track);
// 		audioElement.current.srcObject = stream;

// 		return () => {
// 			if (audioElement.current) {
// 				audioElement.current.srcObject = null;
// 				audioElement.current.onplay = null;
// 				audioElement.current.onpause = null;
// 			}
// 		};
// 	}, []);

// 	useEffect(() => {
// 		const { audioGain } = props.consumer;

// 		if (audioGain !== undefined && audioElement.current)
// 			audioElement.current.volume = audioGain;
// 	}, [ props.consumer.audioGain ]);

// 	return (
// 		<audio
// 			ref={audioElement}
// 			autoPlay
// 		/>
// 	);
// };

// export default AudioView;