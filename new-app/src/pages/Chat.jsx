import { useParams } from "react-router-dom"
import Pusher from "pusher-js"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Chat() {
  const [messages, setMessages] = useState([]);
  let [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  let [toggler, setToggler] = useState(false)
  let ID = JSON.parse(localStorage.getItem('profiles'))
  let { id } = useParams();
  console.log(id, ID)
  useEffect(() => {
    axios.get('http://localhost:5000/profiles')
    .then((response) => {
      response.data.map((res) => {
        if (res._id === ID) {
          setUsername(res.username)
        }
      })
    })
    .catch(error => console.error(error))
  }, [])
  useEffect(() => {
    const pusher = new Pusher('63cbacee7831a9728515', {
      cluster: 'us2',
      authEndpoint: 'http://localhost:5000/pusher/auth',
      logToConsole: true
    });

    const channel = pusher.subscribe(`private-user-${ID}`);
    channel.bind('message', function(data) {
      axios.get('http://localhost:5000/message')
      .then((response) => {
        console.log(response.data)
        let check = []
        let checkId = []
        response.data.every((userMessage) => {
          if (!checkId.includes(userMessage._id) && (userMessage.senderId === ID || userMessage.senderId === id) && (userMessage.userId === ID || userMessage.userId === id)) {
            checkId.push(userMessage._id)
            check.push({username: userMessage.username, message: userMessage.message})
          }
          return true;
        })
        console.log(check)
        setMessages(check)
      })
      console.log(toggler)
      console.log(data)
    });

    return () => {
      pusher.unsubscribe(`private-user-${ID}`);
    };
  }, [message, ID]);

  const sendMessage = async () => {
    await axios.post('http://localhost:5000/message', {
      username,
      message,
      userId: id,
      senderId: ID,
    });
    await axios.get('http://localhost:5000/message')
    .then((response) => {
      console.log(response.data)
      let check = []
      let checkId = []
      response.data.every((userMessage) => {
        if (!checkId.includes(userMessage._id) && (userMessage.senderId === ID || userMessage.senderId === id) && (userMessage.userId === ID || userMessage.userId === id)) {
          checkId.push(userMessage._id)
          check.push({username: userMessage.username, message: userMessage.message})
        }
        return true;
      })
      console.log(check)
      setMessages(check)
    })
    setToggler(!toggler);
    setMessage('');
  };

  useEffect(() => {
    axios.get('http://localhost:5000/message')
    .then((response) => {
      console.log(response.data)
      let check = []
      let checkId = []
      response.data.every((userMessage) => {
        if (!checkId.includes(userMessage._id) && (userMessage.senderId === ID || userMessage.senderId === id) && (userMessage.userId === ID || userMessage.userId === id)) {
          checkId.push(userMessage._id)
          check.push({username: userMessage.username, message: userMessage.message})
        }
        return true;
      })
      console.log(check)
      setMessages(check)
    })
  }, [toggler])

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}