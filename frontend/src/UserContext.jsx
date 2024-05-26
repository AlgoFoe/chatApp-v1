import axios from "axios";
import {createContext, useEffect, useState} from "react";

const UserContext = createContext();

const ContextProvider=({children})=>{
    const [username,setUsername] = useState(null)
    const [id,setId] = useState(null)
    useEffect(()=>{
        axios.get('/profile').then(response=>{
            try {
                setId(response.data.userId);
                setUsername(response.data.user);
            } catch (error) {
                console.log(error);
            }
        })
    },[])
    return (
        <UserContext.Provider value={{username,setUsername,id,setId}}>
            {children}
        </UserContext.Provider>
    )
}
export  {ContextProvider,UserContext};  