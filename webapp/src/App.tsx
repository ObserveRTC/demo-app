import React, { useState, useEffect, useRef } from 'react';
import { MediaServiceProvider } from './contexts/MediaServiceContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppLayout from './AppLayout';
import { Provider } from 'react-redux';
import store from './store/store';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <MediaServiceProvider roomId={'my-test-room'} serviceType='mediasoup'>
        <div className="App">
          <AppLayout />
          {/* <header className="App-header">
            <h1>ObserveRTC Demo App</h1>
          </header>
          <LocalClient />
          <RemoteClients /> */}
        </div>
      </MediaServiceProvider>
    </Provider>
    
  );
};

export default App;
