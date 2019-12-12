import React, { createContext, useEffect, useState } from 'react'

export const UserContext = createContext()

export default ({ children }) => {
    
    const currentUser = window.sessionStorage.getItem('user') !== 'null' ? window.sessionStorage.getItem('user') : ''
    
    const [user, setUser] = useState(currentUser)

    useEffect(() => {
            window.sessionStorage.setItem('user', user);
        },
        [user]
    );
    
    const resetUser = () => {
        setUser('')
    }

    const context = {
        user,
        setUser,
        resetUser
    }

    return (
        <UserContext.Provider value={context}>
            {children}  
        </UserContext.Provider>
    )
    
}