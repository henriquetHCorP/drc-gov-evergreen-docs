import { useOthers } from '@liveblocks/react/suspense';
import Image from 'next/image';
import React from 'react'

const ActiveCollaborators = () => {
    const others = useOthers();
    // useOthers will get other colllaborators in liveblocks
    const collaborators = others.map((other) => other.info)
    return (
   <ul className="collaborative-list">
    {collaborators.map(({id, avatar, name, color}) => (
        // id, avatar, name and color are destructured from the individual collaborator 
      <li key={id}>
         <Image
            src={avatar}
            alt={name}
            width={100}
            height={100}
            className="inline-block size-8 rounded-full ring-2 ring-dark-100"
            style={{border: `3px solid ${color}`}}
         />
      </li>
    ))}

   </ul>
  )
}

export default ActiveCollaborators
