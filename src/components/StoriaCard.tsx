import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius,space } from '@/theme/tokens';
import { Text } from './Text';
import { Icon } from './Icon';
import { layout } from './Primitives';
export function StoriaCard() {const {colors}=useTheme();return <View style={[layout.row,{padding:space.lg,borderRadius:radius.card,backgroundColor:colors.story,gap:space.ml}]}><View style={{width:46,height:46,borderRadius:radius.control,backgroundColor:colors.storyTile,justifyContent:'center',alignItems:'center'}}><Icon name="journal" color={colors.storyText}/></View><View style={layout.flex}><Text variant="card" style={{color:colors.storyText}}>Turn it into a story</Text><Text variant="small" style={{color:colors.storyMuted}}>Export to Storia when you finish</Text></View><Text variant="tab" style={{backgroundColor:colors.storyTile,color:colors.storyMuted,paddingVertical:space.micro,paddingHorizontal:space.s,borderRadius:radius.chip}}>SOON</Text></View>;}
