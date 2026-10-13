import { type PropsWithChildren } from 'react';
import { useDraft } from '@/providers/DraftProvider';
import { Screen } from './Screen';
import { StateView } from './Primitives';
import { go } from '@/lib/navigation';
export function DraftGate({ children }: PropsWithChildren) { const { loading, draft, error } = useDraft(); if (loading) return <Screen><StateView kind="loading" title="Restoring your draft…" /></Screen>; if (!draft) return <Screen><StateView kind={error ? 'error' : 'empty'} title="Start with a goal" message={error ?? 'Tell Milo what you want to achieve to start your path.'} action="Choose a goal" onAction={() => go('/')} /></Screen>; return children; }
