import {
	useRef
} from 'react';
import {
	TypedUseSelectorHook,
	useDispatch, useSelector,
} from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Hook to access the redux dispatch function.
 * 
 * @returns {AppDispatch} The redux dispatch function.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

type ResultBox<T> = { v: T }

/**
 * Hook to access the redux state.
 * 
 * @returns {TypedUseSelectorHook<RootState>} The redux state.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useConstant<T>(fn: () => T): T {
	const ref = useRef<ResultBox<T>>();

	if (!ref.current)
		ref.current = { v: fn() };

	return ref.current.v;
}
