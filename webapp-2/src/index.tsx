import { render } from 'solid-js/web';

import App from './App';
import './index.css';
import { updateClientMediaDevices } from './stores/LocalClientStore';


// initialize
navigator.mediaDevices.ondevicechange = updateClientMediaDevices;

render(() => <App />, document.getElementById('root')!);
