import { W3CStats } from '@observertc/client-monitor-js';
import React, { useEffect } from 'react';
import { Card, Tab, Table, Tabs } from 'react-bootstrap';

export interface ListingTabProps {
	title: string,
	stats: any[]
}

const StatsCard: React.FC<ListingTabProps> = <T extends W3CStats.RtcStats>({ stats, title }: { stats: T[], title: string }) => {

  	useEffect(() => {
	  }, []);

	  return (
		<Card style={{ width: '100%' }}>
			<Card.Body>
			<Card.Title>{title}</Card.Title>
			<Card.Text>
			{
				0 < stats.length 
				? <Tabs 
					defaultActiveKey={stats[0].id} 
					id="fill-tab-example"
					className="mb-3"
					fill
				>
					{stats.map((statsItem, index) => (
						<Tab key={statsItem.id} eventKey={statsItem.id} title={statsItem.id}>
							<Table striped bordered hover size="sm" responsive>
							<tbody>
								{Object.entries(statsItem).filter(([key]) => !key.startsWith('updates-')).map(([key, value], i) => (
								<tr key={`${statsItem.id}-${i}`}>
									<td width="100px" align='left'>{key}</td>
									<td>{value === undefined ? 'N/A' : 30 < `${value}`.length ? `${value}`.slice(0, 30) + `...` : value}</td>
								</tr>
								))}
							</tbody>
							</Table>
							{
								Object.keys(statsItem).find(k => k.startsWith('updates-')) 
								? 	<div>
									<b>client-monitor-js update fields</b>
									<Table striped bordered hover size="sm" responsive>
									<tbody>
										{Object.entries(statsItem).filter(([key]) => key.startsWith('updates-')).map(([key, value], i) => (
										<tr key={`${statsItem.id}-${i}`}>
											<td width="100px" align='left'>{key.replace('updates-', '')}</td>
											<td>{value === undefined ? 'N/A' : 30 < `${value}`.length ? `${value}`.slice(0, 30) + `...` : value}</td>
										</tr>
										))}
									</tbody>
									</Table>
									</div>
									
								: <></>
							}
							
						</Tab>
					))}
					</Tabs>
				: undefined
			}
			</Card.Text>
			{/* <Button variant="primary">Go somewhere</Button> */}
			</Card.Body>
		</Card>
	)
};

export default StatsCard;
