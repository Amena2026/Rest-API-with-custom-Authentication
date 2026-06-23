const Form = ({addNote, newNote, handleNoteChange}) => {
    return (
        <form onSubmit={addNote}>
          <p>insert new note here: </p>
          <input 
            type="text"
            value={newNote}
            onChange={handleNoteChange}
          />
          <button type="submit">save</button>
        </form>
    )

}

export default Form