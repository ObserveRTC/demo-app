import React from 'react';
import { Container, Row, Col, Navbar, ListGroup, Tab, Tabs } from 'react-bootstrap';
import LocalClient from './components/Clients/LocalClient';
import RemoteClients from './components/Clients/RemoteClients';
import StatsTabs from './components/StatsTabs';

  

const AppLayout: React.FC = () => {
  return (
    <>
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg">
	  	<Navbar.Brand style={{ padding: '10px' }} href="#">ObserveRTC Demo Application</Navbar.Brand>
	  	<Container fluid>
      		<Row>
        		<Col xs={12} md={4} style={{ minWidth: '300px', minHeight: '100px' }}>
          			<LocalClient />
        		</Col>
        		<Col xs={12} md={4} style={{ minWidth: '400px', minHeight: '100px' }}>
          			<RemoteClients />
        		</Col>
      		</Row>
    	</Container>
        {/* <Container>
          <Navbar.Brand href="#">ObserveRTC Demo Application</Navbar.Brand>
		  <LocalClient />
		  <RemoteClients />
        </Container> */}
      </Navbar>
      {/* Content */}
	  <StatsTabs />
    </>
  );
};

export default AppLayout;
