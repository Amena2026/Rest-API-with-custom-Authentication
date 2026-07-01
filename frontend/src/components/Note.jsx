const Note = ({content, deleteNote}) => {

    return (
        <li className="note">{content} <button onClick={deleteNote}>delete</button> </li>
    )

}

export default Note