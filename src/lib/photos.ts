import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator,SaveFormat } from 'expo-image-manipulator';
import { randomUUID } from 'expo-crypto';
import { db } from './supabase';
export const storyBucket='milo-stories';
export async function addStoryPhoto(userId:string,goalId:string,stepId:string) {
 const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:0.8,allowsMultipleSelection:false,exif:false});
 if(result.canceled)return false;
 const asset=result.assets[0];
 const context=ImageManipulator.manipulate(asset.uri);if(asset.width>1600)context.resize({width:1600});
 const rendered=await context.renderAsync();const photo=await rendered.saveAsync({format:SaveFormat.JPEG,compress:0.8});
 let bytes:ArrayBuffer;
 if(Platform.OS==='web')bytes=await(await fetch(photo.uri)).arrayBuffer();else {const {File}=await import('expo-file-system');bytes=await new File(photo.uri).arrayBuffer();}
 if(bytes.byteLength>5*1024*1024)throw new Error('Choose a smaller photo (under 5 MB).');
 const path=`${userId}/${stepId}/${randomUUID()}.jpg`;
 const uploaded=await db().storage.from(storyBucket).upload(path,bytes,{contentType:'image/jpeg',upsert:false});if(uploaded.error)throw uploaded.error;
 const note=await db().from('notes').insert({user_id:userId,goal_id:goalId,step_id:stepId,text:'',photo_url:path});
 if(note.error){await db().storage.from(storyBucket).remove([path]);throw note.error;}
 return true;
}
