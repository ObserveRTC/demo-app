/* eslint-disable no-unused-vars */
import { JSX, ParentComponent, children, createSignal } from 'solid-js';
import { Collapse } from 'solid-collapse';
import './style.css';
import { Button } from '@suid/material';

export type CardProps = {
	title: string | JSX.Element,
	icon?: JSX.Element,
	open?: boolean,
	onOpen?: () => void,
	onClose?: () => void,
	onStateChange?: (state: boolean) => void,
}

export const Accordion: ParentComponent<CardProps> = (props) => {
	const [ isExpanded, setIsExpanded ] = createSignal(props.open ?? false);
	const child = children(() => props.children);
	const onClick = () => {
		if (isExpanded()) {
			setIsExpanded(false);
			props.onStateChange?.(false);
			props.onClose?.();
		} else {
			setIsExpanded(true);
			props.onOpen?.();
			props.onStateChange?.(true);
		}
	};
	
	return (
		<div>
			<div style={{ display: 'flex' }}>
				<div style={{ float: 'left', width: '90%' }}>{props.title}</div>
				<div style={{ float: 'right' }}>
					<Button onClick={onClick}>{isExpanded() ? 'Close' : 'Open'}</Button>
				</div>
			</div>
			<div style={{ clear: 'both' }} />
			<Collapse value={isExpanded()} class="my-transition">
				{child()}
			</Collapse>
		</div>
	);
};
