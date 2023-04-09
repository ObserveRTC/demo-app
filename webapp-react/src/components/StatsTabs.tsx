import React, { useEffect } from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import { useAppSelector } from "../store/hooks";
import IceStats from "./Stats/IceStats";
import LocalCLientsStats from "./Stats/LocalClientStats";
import PeerConnectionStats from "./Stats/PeerConnectionStats";
import RemoteClientsStats from "./Stats/RemoteClientStats";

const StatsTabs: React.FC = () => {
	const remoteClients = useAppSelector(state => state.remoteClients.clients);
	const localClient = useAppSelector(state => state.localClient);
	useEffect(() => {
  
	  return () => {
	  };
	}, []);
  
	return (
		<Tab.Container id="left-tabs" defaultActiveKey="first">
		  <Row>
			<Col sm={2}>
			  <Nav variant="pills" className="flex-column">
			  	<Nav.Item>
				  <Nav.Link eventKey="pc-stats">PeerConnections</Nav.Link>
				</Nav.Item>
				<Nav.Item>
				  <Nav.Link eventKey="ice-stats">ICE</Nav.Link>
				</Nav.Item>
				<Nav.Item>
				  <Nav.Link eventKey={localClient.clientId}>{localClient.userId ?? localClient.clientId} Stats</Nav.Link>
				</Nav.Item>
				{remoteClients.map(remoteClient => (
					<Nav.Item>
				  		<Nav.Link eventKey={remoteClient.clientId}>{remoteClient.userId ?? remoteClient.clientId} Stats</Nav.Link>
					</Nav.Item>
				))}
			  </Nav>
			</Col>
			<Col sm={9}>
			  <Tab.Content>
			  	<Tab.Pane eventKey="pc-stats">
				  	<PeerConnectionStats />
				</Tab.Pane>
				<Tab.Pane eventKey="ice-stats">
				  	<IceStats />
				</Tab.Pane>
				<Tab.Pane eventKey={localClient.clientId}>
					<LocalCLientsStats />
				</Tab.Pane>
				{remoteClients.map(remoteClient => (
					<Tab.Pane eventKey={remoteClient.clientId}>
						<RemoteClientsStats clientId={remoteClient.clientId} />
					</Tab.Pane>
				))}
			  </Tab.Content>
			</Col>
		  </Row>
		</Tab.Container>
	  );
};

export default StatsTabs;
