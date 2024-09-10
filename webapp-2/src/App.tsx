import { Switch, type Component, Match } from 'solid-js';
import { page } from './signals/signals';
import Join from './views/Join';
import Monitor from './views/Monitor';
import Results from './views/Results';
import { Transition } from 'solid-transition-group';
import ObserverView from './views/ObserverView';


const App: Component = () => {
	return (
		<Transition name='fade' mode='outin'>
			<Switch>
				<Match when={page() === 'lobby'}><Join/></Match>
				<Match when={page() === 'room'}><Monitor/></Match>
				<Match when={page() === 'exit'}><Results /></Match>
				<Match when={page() === 'observer'}><ObserverView /></Match>
			</Switch>
		</Transition>
		
	);
};

export default App;
