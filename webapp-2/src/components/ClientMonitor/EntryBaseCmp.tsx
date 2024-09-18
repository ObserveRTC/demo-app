import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@suid/material';
import { Component, For, JSXElement, Setter, Show } from 'solid-js';
import { clientStore } from '../../stores/LocalClientStore';
import JSONFormatter from 'json-formatter-js';
import Button from '../Button';
import { ClientMonitorEntryRender } from './ClientMonitorShowEntry';
import ClientMonitorEntryCmp from './ClientMonitorEntry';

export type EntryBaseCmpProps = {
	properties: Record<string, unknown>;
	navigations: NavigationItem[];
	iterableNavigations: IterableNavigationItem[];
	next: Setter<ClientMonitorEntryRender>;
}

export type NavigationItem = {
	name: string,
	buttonName: string,
	action?: () => JSXElement;
};

export type IterableNavigationItem = {
	name: string,
	items: {
		key: string,
		action: () => JSXElement;
	}[]
};

const EntryBaseCmp: Component<EntryBaseCmpProps> = (props: EntryBaseCmpProps) => {
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				{/* <TableHead>
					<TableRow>
						<TableCell>Property</TableCell>
						<TableCell>value</TableCell>
					</TableRow>
				</TableHead> */}
				<TableBody>
					<TableRow
						sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
					>
						<TableCell component="th" scope="row">
							Properties:
						</TableCell>
						<TableCell align="left">
							{new JSONFormatter(props.properties, 3).render()}
						</TableCell>
					</TableRow>
					<For each={props.navigations}>
						{(navigation) => (
							<TableRow
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{`${navigation.name}`}
								</TableCell>
								<TableCell align="left">
									<Show when={navigation.action} fallback={'undefined'}>
										<button
											onClick={() => props.next({
												name: navigation.buttonName,
												action: navigation.action!
											})}
											class='flex justify-center rounded-md bg-indigo-600 p-1.5 mt-4 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-slate-200'
										>
											{navigation.buttonName}
										</button>
									</Show>
								</TableCell>
							</TableRow>
						)}
					</For>
					<For each={props.iterableNavigations.filter(item => 0 < item.items.length)}>
						{(iterableNavigation) => (
							// <Show when={iterableNavigation.items.length > 0}>
							<TableRow
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{`${iterableNavigation.name}`}
								</TableCell>
								<TableCell align="left">
									<For each={iterableNavigation.items}>
										{(item) => (
											<button
												onClick={() => props.next({
													name: item.key,
													action: item.action
												})}
												class='flex justify-center rounded-md bg-indigo-600 p-1.5 mt-4 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-slate-200'
											>
												{item.key}
											</button>
										)}
									</For>
								</TableCell>
							</TableRow>
							// </Show>
						)}
					</For>
					<TableRow
						sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
					>
						<TableCell component="th" scope="row" colSpan={2}>
							<Button
								title='Goto ClientMonitor'
								onClick={() => props.next({
									name: 'ClientMonitor',
									action: () => ClientMonitorEntryCmp({
										entry: clientStore.call?.monitor!,
										next: props.next
									})
								})}
							/>
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default EntryBaseCmp;