import React from 'react'
import { API } from '../services/APIService';
import PostItem from './PostItem';
import '../styles/PostContainer.css'
import { useState } from 'react';

const PostContainer = () => {
    const [date_sort, setDate] = useState(1);
    const [like_sort, setLike] = useState(1);
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = API.useGetPostsQuery({ date_sort, like_sort, page });

    if (data && data.length === 0 && page > 1) {
        setPage(page - 1);
    }

    return (
        <div className='short_post_page'>
            <div className='sort_container'>
                <div className='sort_control'>
                    <select defaultValue={1} onChange={(e) => setDate(e.target.value)}>
                        <option value={1}>Newest</option>
                        <option value={0}>Oldest</option>
                    </select>
                    <select defaultValue={1} onChange={(e) => setLike(e.target.value)}>
                        <option value={1}>Most liked</option>
                        <option value={0}>Least liked</option>
                    </select>
                </div>
                <div className='page_control'>
                    <button className="btn-6" onClick={(e) => { if (page > 1) setPage(page - 1) }}>&#60;</button>
                    <span>{page}</span>
                    <button className="btn-5" onClick={(e) => setPage(page + 1)}>&#62;</button>
                </div>
            </div>
            <div className='post_container'>
                {isLoading && <h1>Идёт загрузка...</h1>}
                {error && <h1>{error.data}</h1>}
                {data &&
                    data.map(post =>
                        <PostItem key={post.id} post={post} />
                    )
                }
            </div>
        </div>
    )
}

export default PostContainer;