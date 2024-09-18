import { createSignal, onMount, type Component } from 'solid-js';
import Box from '../components/Box';
import { Button } from '@suid/material';
import { setPage } from '../signals/signals';
import { clientStore } from '../stores/LocalClientStore';
import { PaperItem } from '../components/PaperItem';
import { writeClipboard } from '@solid-primitives/clipboard';

// import { setTestState } from '../signals/signals';
// import Button from '../components/Button';

// const TestResults = lazy(() => import('../components/TestResults'));

const Menu: Component = () => {
	const [ copyBtnText, setCopyBtnText ] = createSignal<string | undefined>(clientStore.call?.callId);
	onMount(() => setPage('lobby'));
    
	return (
		<Box title="">
			<PaperItem>Call: 
				<Button 
					disabled={Boolean(clientStore.call) === false}
					onClick={() => {
						writeClipboard(clientStore.call?.callId ?? '');
						setCopyBtnText('Copied');
						setTimeout(() => {
							setCopyBtnText(clientStore.call?.callId);
						}, 2000);
					}}> {copyBtnText()}
				</Button>
			</PaperItem>
			<Button 
				onClick={() => setPage('stunner')}
				disabled={Boolean(clientStore.call) === false}
			>
                    Stunner
			</Button>
			<Button 
				onClick={() => setPage('observer')}
				disabled={Boolean(clientStore.call) === false}
			>
                    Observer
			</Button>
			<Button 
				onClick={() => setPage('videoCall')}
				disabled={Boolean(clientStore.call) === false}
			>
                VideoCall
			</Button>

			<Button 
				onClick={() => setPage('clientMonitor')}
				disabled={Boolean(clientStore.call) === false}
			>
                ClientMonitor
			</Button>
		</Box>
	);
};

export default Menu;
