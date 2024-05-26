import { useContext } from 'react';
import { UserContext } from './UserContext';
import RegisterAndLogin from './components/RegisterAndLogin';
import axios from 'axios';
import Chat from './components/Chat';

function App() {
  axios.defaults.baseURL = 'http://localhost:7001'
  axios.defaults.withCredentials = true;
  const {username,id} = useContext(UserContext);
  if(username){
    return <Chat/>
  }
  return (
    <RegisterAndLogin/>
  );
}

export default App;
