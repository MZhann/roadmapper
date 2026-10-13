import type { ErrorBoundaryProps } from 'expo-router';
import { StateView } from './Primitives';
export function ErrorBoundary({ retry }: ErrorBoundaryProps) { return <StateView kind="error" title="Let's take that step again" message="Milo couldn't display this screen. Your saved progress is safe." action="Try again" onAction={() => void retry()} />; }
