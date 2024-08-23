"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async({ userIds } : { userIds: string[]}) => {
   try {
      const { data } = await clerkClient.users.getUserList({
        emailAddress: userIds, 
      }); 

      const users = data.map((user) => ({
        id: user.id, 
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailAddresses[0].emailAddress,
        avatar: user.imageUrl, 
      })); 
        // here we wanna sort the users by the usersIds; 

      const sortedUsers = userIds.map((email) => users.find((user) => user.email === email));

      return parseStringify(sortedUsers); 
   } catch(error) {
    console.log(`Error fetching users: ${error}`)
   }
}

export const getDocumentUsers = async({ roomId, currentUser, text } : { roomId: string, currentUser: string, text: string} ) => {
     try { 
      const room = await liveblocks.getRoom(roomId); 
      //  ABOVE HERE WE CAN HAVE ACCESS TO THE ROOM INFORMATION.
     
      const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser);  
      //  Above here WE GET GET ACCESS TO THE USERS WITHIN THAT ROOM; 
    
      if(text.length) {
        // if we wanna mention somebody ==> @....exist
        const lowerCaseText = text.toLowerCase();
        
        const filteredUsers = users.filter((email: string) => email.toLowerCase().includes(lowerCaseText));
        
        return parseStringify(filteredUsers); 
      }
      return parseStringify(users); 
    } catch(error) {
      console.log(`Error fetching document users:${error}`)
     }
}