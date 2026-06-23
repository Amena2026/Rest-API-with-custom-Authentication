import axios from "axios"
import { useState, useEffect } from "react"
import Note from "./components/Note"
import Form from "./components/Form"
import noteService from './services/notes'

const App = () => {
  
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState([' '])

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

  const addNote = event => {
    event.preventDefault()

    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5
    }

    noteService
     .create(noteObject)
     .then(response => {
      setNotes(notes.concat(response.data))
      setNewNote('')
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

  const handleNoteChange = () => {
    setNewNote(event.target.value)
  }


  return (
    <div>
      <Form
        addNote={addNote}
        newNote={newNote}
        handleNoteChange={handleNoteChange} 
      />
      <ul>
        {notes.map(
          note => <Note key={note.id} content={note.content} deleteNote={() => handleDelete(note.id)}/>
        )}
      </ul>  
    </div>
  )
}

export default App
