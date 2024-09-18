import { Component } from 'solid-js';
import Box from '../Box';
import l7mp from './l7mp.png';
import observertc from './observertc.png';
import { TableBody, TableCell, TableRow } from '@suid/material';

const PoweredByCmp: Component = () => {
	return (
		<Box title={'Powered By'} full={true}>
			<TableBody>
				<TableRow
					sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
				>
					<TableCell component="th" scope="row">
						<img src={l7mp} alt="L7mp" width={200} />
					</TableCell>
					<TableCell align="left">
						<img src={observertc} alt="L7mp"  width={200} />
					</TableCell>
				</TableRow>
			</TableBody>
		</Box>
	);
};

export default PoweredByCmp;
