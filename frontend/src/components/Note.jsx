const Note = ({content, deleteNote}) => {

    return (
        <li>{content} <button onClick={deleteNote}>delete</button> </li>
    )

}

export default Note