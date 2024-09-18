import { Switch, type Component, Match } from 'solid-js';
import { page } from './signals/signals';
import Join from './views/Join';
import Results from './views/Results';
import { Transition } from 'solid-transition-group';
import ObserverView from './views/OngoingCalls';
import { Grid } from '@suid/material';
import Menu from './views/Menu';
import ClientMonitor from './components/ClientMonitor/ClientMonitor';
import PoweredByCmp from './components/PoweredBy/PoweredByCmp';
import VideoCall from './views/VideoCall';


const App: Component = () => {
	return (
		<Grid container spacing={2}>
			<Grid item xs={2}>
				<Menu />
			</Grid>
			<Grid item xs={10}>
				<Transition name='fade' mode='outin'>
					<Switch>
						<Match when={page() === 'lobby'}><Join/></Match>
						<Match when={page() === 'clientMonitor'}><ClientMonitor /></Match>
						<Match when={page() === 'videoCall'}><VideoCall /></Match>
						<Match when={page() === 'exit'}><Results /></Match>
						<Match when={page() === 'observer'}><ObserverView /></Match>
					</Switch>
				</Transition>
			</Grid>
			<Grid item xs={12}>
				<PoweredByCmp />
			</Grid>
		</Grid>
	
		
	);
};

export default App;
