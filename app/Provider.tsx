"use client"; 
// since we are using a provider , we'll have to make use of the use client directive 
import React, { ReactNode } from 'react'
import {ClientSideSuspense, LiveblocksProvider} from '@liveblocks/react/suspense'
import Loader from '@/components/Loader';
import { getClerkUsers, getDocumentUsers } from '@/lib/actions/user.actions';
import { useUser } from '@clerk/nextjs';

const Provider = ({children} : { children: ReactNode}) => {
  const {user: clerkUser} = useUser();  
  return (
    <LiveblocksProvider 
       authEndpoint="/api/liveblocks-auth"
       resolveUsers={async({userIds}) => {
        const users = await getClerkUsers({userIds}); 
        // we userIds = userIds, in here we get the userIds from liveBlocks(resolvers: userIds); 
        return users; 
       }}
       resolveMentionSuggestions={async({ text, roomId }) => {
         const roomUsers = await getDocumentUsers({
          roomId, 
          currentUser: clerkUser?.emailAddresses[0].emailAddress!,
          text, 
         })  

         return roomUsers; 
         
       }}
       >
        <ClientSideSuspense fallback={<Loader />}>
          {children}
        </ClientSideSuspense>
       
    </LiveblocksProvider>
  );
}

export default Provider

 