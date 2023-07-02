import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { API } from "../services/APIService";
import '../styles/PostPage.css';
import getFormattedDate from "../utils/time";
import { USER_PAGE } from '../utils/consts'
import { useState } from "react";

const PostPage = () => {

    const { id } = useParams();
    const { isAuth, id: user_id } = useSelector(state => state.authReducer);
    const { data, isLoading, error } = API.useGetOnePostQuery(id);
    const [update_post] = API.useUpdatePostMutation();
    const [form, setForm] = useState(false);

    const update_handler = async (e) => {
        e.preventDefault();
        await update_post({ id, content: new FormData(e.target) });
        setForm(!form)
    }

    return (
        <div className="post_page">
            {form &&
                <div className="form_post_container">
                    <form className="post_update_form" onSubmit={update_handler}>
                        Post update
                        <input name="content" type="text" placeholder="Content" />
                        <div>
                            <button onClick={() => setForm(!form)}>Cancel</button>
                            <button type="submit">Confirm</button>
                        </div>
                    </form>
                </div>}
            {isLoading && <h1>Идёт загрузка...</h1>}
            {error && <h1>{error.data.message}</h1>}
            {data &&
                <div className="post">
                    <div>
                        <UserInfo userId={data.userId} />
                        <div className="post_content">
                            <h1>{data.title}</h1>
                            <span>{data.content}</span>
                            {user_id == data.userId && <button onClick={() => setForm(!form)}>Update</button>}
                        </div>
                    </div>
                    <h2>Comments</h2>
                    {isAuth && <CommentCreate id={id} />}
                    <Comments postId={id} />
                </div>
            }
        </div>
    );
};

const UserInfo = ({ userId }) => {

    const { data, isLoading, error } = API.useGetUserQuery(userId);

    return (
        <div className="post_author">
            {isLoading && <h1>Идёт загрузка...</h1>}
            {error && <h1>{error.data.message}</h1>}
            {data &&
                <>
                    <Link to={USER_PAGE + `/${data.id}`}><img src={`http://localhost:5000/${data.profile_picture}`} alt=" " /></Link>
                    <Link to={USER_PAGE + `/${data.id}`}><span>{data.login}</span></Link>
                    <span>Rating: {data.rating}</span>
                    <span>Role: {data.role}</span>
                    <span>With us from: {getFormattedDate(data.createdAt)}</span>
                </>
            }
        </div>
    );
};

const Comments = ({ postId }) => {
    const { data, isLoading, error } = API.useGetCommentsQuery(postId);

    return (
        <div className="comment_container">
            {isLoading && <h1>Идёт загрузка...</h1>}
            {error && <h1>{error.data.message}</h1>}
            {data && data.map(comment => {
                return <Comment key={comment.id} comment={comment} />
            })
            }
        </div>
    )
}

const Comment = ({ comment }) => {

    const { data, isLoading, error } = API.useGetCommentLikesQuery(comment.id);
    const [setLike] = API.useCreateCommentLikeMutation();
    const { id, isAuth } = useSelector(state => state.authReducer);
    const [deleteLike] = API.useDeleteCommentLikeMutation();
    const inputEl = useRef(null);

    const like_handler = async (e) => {
        if (!isAuth) {
            return;
        }
        if (data.find(element => element.userId == id)) {
            deleteLike(comment.id);
            e.currentTarget.classList.remove('effect');
        } else {
            setLike(comment.id);
            e.currentTarget.classList.add('effect');
        }
    }

    useEffect(() => {
        if (data) {
            if (data.find(element => element.userId == id)) {
                inputEl.current.classList.add('effect');
            } else {
                inputEl.current.classList.remove('effect');
            }
        }
    }, [data, id])

    return (
        <div className="comment">
            <UserInfo userId={comment.userId} />
            <div className="post_content">
                <span>{comment.content}</span>
            </div>
            <div>
                {isLoading && <h1>Идёт загрузка...</h1>}
                {error && <h1>{error.data.message}</h1>}
                {data &&
                    <>
                        <span style={{ fontWeight: 600, fontSize: 24 }}>{data.length}</span>
                        <button ref={inputEl} className="button-85" onClick={like_handler}><i className="fa-solid fa-thumbs-up"></i></button>
                    </>
                }
            </div>
        </div>
    )
}

const CommentCreate = ({ id }) => {

    const [create, { error }] = API.useCreateCommentMutation();

    const create_handler = async (e) => {
        e.preventDefault();
        await create({ id, content: new FormData(e.target) });
    }

    return (
        <div className="create_comment_container">
            <form className="create_comment" onSubmit={create_handler}>
                <textarea name="content" cols="50" rows="5" placeholder="Enter message"></textarea>
                <button type="submit"><i className="fa-solid fa-paper-plane"></i></button>
                {error && <span>{error.data.message}</span>}
            </form>
        </div>
    )
}

export default PostPage;