import { Paper, styled } from '@suid/material';

export const PaperItem = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.secondary,
	border: '1px solid gray',
	margin: '1rem 0rem 0rem 0rem',
	textAlignLast: 'left',
}));

export const ErrorPaperItem = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.primary,
	backgroundColor: theme.palette.error.light,
	border: '1px solid gray',
	margin: '1rem 0rem 0rem 0rem',
	textAlignLast: 'left',
}));

export const NotingPaperItem = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.primary,
	backgroundColor: theme.palette.info.light,
	border: '1px solid gray',
	margin: '1rem 0rem 0rem 0rem',
	textAlignLast: 'left',
}));

export const SuggestingPaperItem = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.secondary,
	backgroundColor: theme.palette.grey[300],
	border: '1px solid gray',
	margin: '1rem 0rem 0rem 0rem',
	textAlignLast: 'left',
}));