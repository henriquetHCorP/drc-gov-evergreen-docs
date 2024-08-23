
import CollaborativeRoom from '@/components/CollaborativeRoom'
import { getDocument } from '@/lib/actions/room.actions';
import { getClerkUsers } from '@/lib/actions/user.actions';
import { parseStringify } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'

const Document = async({ params: { id }}: SearchParamProps) => {
  // we can access or get to the userId throught the currentuser
  const clerkUser = await currentUser(); 
  if(!clerkUser) redirect('/sign-in'); 
  // we will call the getDocument from this page where we are trying to fetch information about that specific room (roomId)
  const room = await getDocument({
    roomId: id, 
    userId: clerkUser.emailAddresses[0].emailAddress,
    // in this case we are making use of the emailAddress as userId because email address is unique;  
  }); 
  
  if(!room) {
    redirect('/'); 
  }
  //Assess the permissions of the user to access the document; 
  const userIds = Object.keys(room.usersAccesses); 
  // object.keys==> to get only the ids; 
  const users = await getClerkUsers({userIds}); 


    const usersData = users.map((user: User) => ({
      ...user, 
      // above here we spread all the properties of that specific user; 
      userType: room.usersAccesses[user.email]?.includes('room:write')?'editor' : 'viewer', 
    }))
  
  // const usersData = users.map((user: User) => ({
  
  //   ...user, 
  //   // above here we spread all the properties of that specific user; 
  //   userType: room.usersAccesses[user.email]?.includes('room:write')?'editor' : 'viewer', 
    
  // }))
  

  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer'
  return (
    <main className="flex w-full flex-col items-center">
         <CollaborativeRoom 
           roomId={id}
           roomMetadata={room.metadata}
           users={usersData}
           currentUserType={currentUserType}
         /> 
    </main>
  )
}

export default Document