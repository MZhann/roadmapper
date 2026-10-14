import { type PropsWithChildren,type ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { Screen } from './Screen';
import { Text } from './Text';
import { IconButton } from './Buttons';
import { layout } from './Primitives';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { space } from '@/theme/tokens';
export function Sheet({visible,title,onClose,children,footer}:{visible:boolean;title:string;onClose:()=>void;footer?:ReactNode}&PropsWithChildren) {const reduced=useReducedMotion();return <Modal visible={visible} animationType={reduced?'none':'slide'} presentationStyle="pageSheet" onRequestClose={onClose}><Screen footer={footer}><View style={[layout.between,{marginBottom:space.page}]}><Text variant="heading" style={layout.flex}>{title}</Text><IconButton name="close" label={`Close ${title}`} onPress={onClose}/></View>{children}</Screen></Modal>;}
