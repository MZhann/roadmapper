import { useEffect } from 'react';
import { View } from 'react-native';
import Animated,{useAnimatedStyle,useSharedValue,withSequence,withTiming} from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { Icon } from './Icon';
import { Mascot } from './Mascot';
export function CompletionBadge() {
 const {colors}=useTheme();const reduced=useReducedMotion();const scale=useSharedValue(1);
 useEffect(()=>{if(reduced)scale.set(1);else{scale.set(0.6);scale.set(withSequence(withTiming(1.06,{duration:360}),withTiming(1,{duration:160})));}},[reduced,scale]);
 const animated=useAnimatedStyle(()=>({transform:[{scale:scale.get()}]}));
 return <View style={{width:160,height:160,borderRadius:radius.round,backgroundColor:colors.accentSoft}}><Animated.View style={[{position:'absolute',left:24,top:24,width:112,height:112,borderRadius:radius.round,backgroundColor:colors.accent,boxShadow:`0 8px 0 ${colors.accentDeep}`,alignItems:'center',justifyContent:'center'},animated]}><Icon name="check" size={56} stroke={3} color={colors.onAccent}/></Animated.View><View style={{position:'absolute',right:-6,top:8,width:12,height:12,borderRadius:radius.round,backgroundColor:colors.warning}}/><View style={{position:'absolute',left:-10,top:70,width:8,height:8,borderRadius:radius.round,backgroundColor:colors.accent}}/><View style={{position:'absolute',right:-40,bottom:-16}}><Mascot size={64} mood="cheer"/></View></View>;
}
