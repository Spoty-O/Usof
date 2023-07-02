import React, { useRef } from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { API } from '../services/APIService';
import '../styles/PostItem.css'
import { POST_PAGE, USER_PAGE } from '../utils/consts';
import getFormattedDate from '../utils/time';
import CategoriesContainer from "../components/CategoriesContainer";
import { useEffect } from 'react';
import '../styles/LikeItem.css'

const PostItem = ({ post }) => {
    const { data } = API.useGetUserQuery(post.userId);
    const [delete_post] = API.useDeletePostMutation();
    const [setLike, { error }] = API.useCreateLikeMutation();
    const [deleteLike] = API.useDeleteLikeMutation();
    const { id, role, isAuth } = useSelector(state => state.authReducer);
    const inputEl = useRef(null);


    const like_handler = async (e) => {
        if (!isAuth) {
            return;
        }
        if (post.post_likes.find(element => element.userId == id)) {
            deleteLike(post.id);
            e.currentTarget.classList.remove('effect');
        } else {
            setLike(post.id);
            e.currentTarget.classList.add('effect');
        }
    }

    useEffect(() => {
        if (post.post_likes.find(element => element.userId == id)) {
            inputEl.current.classList.add('effect');
        } else {
            inputEl.current.classList.remove('effect');
        }
    }, [data, id])

    const delete_handle = async (e) => {
        await delete_post(post.id);
    }

    return (
        <div className='short_post'>
            <div className='user_info'>
                {data &&
                    <>
                        <Link to={USER_PAGE + `/${data.id}`}><img src={`http://localhost:5000/${data.profile_picture}`} alt=" " /></Link>
                        <span><Link to={USER_PAGE + `/${data.id}`}>{data.login}</Link></span>
                        <span>{getFormattedDate(post.createdAt)}</span>
                    </>
                }
            </div>
            <div className='post_info'>
                <h1><Link className='link' to={POST_PAGE + `/${post.id}`}>{post.title}</Link></h1>
                <span>{post.content}</span>
                <CategoriesContainer handler={"ok"} categories={post.categories} description={false} />
            </div>
            <div className='button_delete_container'>
                {(role == 'ADMIN' || id == post.userId) && <button className="button-24" onClick={delete_handle}>Delete</button>}
            </div>
            <div className='like_container'>
                <span style={{ fontWeight: 600, fontSize: 24 }}>{post.likescount}</span>
                <button ref={inputEl} className="button-85" onClick={like_handler}><i className="fa-solid fa-thumbs-up"></i></button>
            </div>
        </div>
    )
}

export default PostItem;