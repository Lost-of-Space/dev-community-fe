import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import PostEditor from "../components/post-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";
import { credentialHeaders } from '~/services/credentials'

const postStructure = {
  title: '',
  banner: '',
  content: [],
  tags: [],
  des: '',
  author: { personal_info: {} }
}

export const EditorContext = createContext({})

const Editor = () => {

  let { post_id } = useParams();

  const [post, setPost] = useState(postStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false })
  const [loading, setLoading] = useState(true);

  let { userAuth: { access_token } } = useContext(UserContext)

  useEffect(() => {
    if (!post_id) {
      return setLoading(false);
    }

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-post`, { post_id, draft: true, mode: 'edit' }, {
      headers: {
        ...credentialHeaders
      }
    })
      .then(({ data: { post } }) => {
        setPost(post);
        setLoading(false);
      })
      .catch(err => {
        setPost(null);
        setLoading(false);
      })

  }, [])

  return (
    <EditorContext.Provider value={{ post, setPost, editorState, setEditorState, textEditor, setTextEditor }}>
      {

        access_token === null ? <Navigate to="/signin" />
          :
          loading ? <Loader />
            :
            editorState == "editor" ? <PostEditor /> : <PublishForm />
      }
    </EditorContext.Provider>
  )
}

export default Editor;