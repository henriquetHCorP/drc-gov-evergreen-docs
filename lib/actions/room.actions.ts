"use server"; 
// this is server component because this liveblocks is imported from liveblock/node ===> node ran on server and not the client 

import { nanoid } from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';

export const createDocument = async({ userId, email}: CreateDocumentParams ) =>{
    const roomId = nanoid(); 

    try {
      const metadata = {
        creatorId: userId, 
        email,
        title:'Untitled'
      }

      const usersAccesses: RoomAccesses = {
        [email]: ['room:write']
        // above here, it will have the permission of room:write ==> users can edit any document
      } 

      const room = await liveblocks.createRoom(roomId, {
        metadata, 
        usersAccesses, 
        defaultAccesses: []
      });

      revalidatePath('/');

      return parseStringify(room); 
    } catch(error) {
       console.log(`Error happened while a room: ${error}`)
    }
}

export const getDocument = async({roomId, userId} : {roomId: string; userId: string})=>{
  try {
      // document is going with room; 
      const room = await liveblocks.getRoom(roomId); 
      // check if the user has access to the document room; 
      // T-O-D-O: bring back hasAccess(done); 
      const hasAccess = Object.keys(room.usersAccesses).includes(userId); 

      if(!hasAccess) {
        throw new Error('You do not have access to this document'); 
      }
      return parseStringify(room);
  } catch(error) {
    console.log(`Error happened while getting a room:${error}`)
  }
}

export const updateDocument = async(roomId: string, title: string) => {
  try{
      const updateRoom = await liveblocks.updateRoom(roomId, {
        metadata: {
          title
        }
      })

      revalidatePath(`/documents/${roomId}`); 

      return parseStringify(updateRoom); 
  }catch(error) {
    console.log(`Error happened while updating a room: ${error}`); 
  }

}

export const getDocuments = async(email:string)=>{
  try {
      // document is going with room; 
      const rooms = await liveblocks.getRooms({userId:email}); 
      
      return parseStringify(rooms);
  } catch(error) {
    console.log(`Error happened while getting rooms:${error}`)
  }
}

export const updateDocumentAccess = async({ roomId, email, userType, updatedBy }: ShareDocumentParams) => {
 try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType)  as AccessType, 
    }

    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses
    })
    
    if(room) {
      //T-O-D-O:==> DONE: send a notification  
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId, 
        activityData: {
          userType, 
          title:`You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy:updatedBy.name,
          avatar: updatedBy.avatar, 
          email: updatedBy.email,
        },
        roomId
        // we are getting acccess to all the activityData through props inside the notification component,
      })
  }

  revalidatePath(`/document/${roomId}`); 
  return parseStringify(room); 
 } catch(error) {
  console.log(`Error happened while updating the room access: ${error}`)
 }
}

export const removeCollaborator = async({ roomId,email}: { roomId: string, email:string}) => {
  try {
     const room = await liveblocks.getRoom(roomId); 

     if(room.metadata.email === email) {
      throw new Error("You cannot remove yourself from the document"); 
      //as you are the owner you're the only person you can modify permission , you can not remove yourself; 
     }

     const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null
      }
     })
  }catch(error) {
    console.log(`Error happened while removing a collaborator: ${error}`)
  }

}

export const deleteDocument = async(roomId:string) => {
// to delete a document, roomId is like documentId; 
try {
  await liveblocks.deleteRoom(roomId); 
  revalidatePath('/'); 
  redirect('/'); 
} catch(error) {
  console.log(`Error happened while deleting a room: ${error}`)
}
}