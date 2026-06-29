import { useState, useEffect, useRef } from "react"
import Note from "./components/Note"
import Form from "./components/Form"
import LoginForm from "./components/LoginForm"
import noteService from './services/notes'
import loginService from './services/login'
import NoteForm from "./components/NoteForm"
import Togglable from "./components/Togglable"

const App = () => {
  
  const [notes, setNotes] = useState([])
  const [user, setUser] = useState(null)

  const noteFormRef = useRef()


  // to load the screen with existing notes data, were going to make a Http get request with the axious library 
  // to the localhost:3001/notes url, then update the state of notes with the data of the response returned 
  // from that url 

  useEffect(() => {
    noteService
     .getAll()
     .then(response => {
       setNotes(response.data)
     })
  },[])
  
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, []) 

  const userLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)

      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )

      noteService.setToken(user.token)
      setUser(user)
    } catch {
      console.log('invalid credentials')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    setUser(null)
  }

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility()
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }

  const handleDelete = id => {
    console.log("id: ", id)
    console.log("notes before delete", notes)
    const url = `http://localhost:3001/notes/${id}`
    const note = notes.find(n => n.id == id)
    
    console.log("url:", url)
    console.log("note:", note)


     noteService
      .remove(id)
      .then(() => {
        setNotes(notes.filter(n => n.id !== id))
      })
    
  }

  const showLoginForm = () => (
    <Togglable buttonLabel= 'log in'>
      <LoginForm userLogin={userLogin}/>
    </Togglable>
  )
  
  const showNoteForm = () => (
    <Togglable buttonLabel= 'new note' ref={noteFormRef}>
      <NoteForm createNote={addNote}/>
    </Togglable>
  )

  /*

      next steps ***
      yesterday we moved the state responsible for creating new notes down from the app component to the NoteForm component
      we want to do the same thing with the login Form



  */

  return (
    <div>
      {!user && showLoginForm()}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          <button onClick={handleLogout}>logout</button>
          {showNoteForm()}
        </div>
      )}
      <ul>
        {notes.map(
          note => <Note key={note.id} content={note.content} deleteNote={() => handleDelete(note.id)}/>
        )}
      </ul>
    </div>
  )
}

export default App
