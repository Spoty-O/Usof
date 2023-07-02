import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react'
import { setCredentials, logOut } from './authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:5000/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().authReducer.token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);


    if (result.data && args.url === '/auth/refresh-token') {
        api.dispatch(setCredentials({ data: result.data }))
    } else if (result?.error?.status === 403) {
        console.log("logout")
        api.dispatch(logOut());
    }

    if (result?.error?.status === 401) {
        console.log('sending refresh token');
        const refreshResult = await baseQuery('/auth/refresh-token', api, extraOptions);
        if (refreshResult.data) {
            api.dispatch(setCredentials({ data: refreshResult.data }))
            result = await baseQuery(args, api, extraOptions)
        } else {
            api.dispatch(logOut());
        }
    }
    return result;
}

export const API = createApi({
    reducerPath: 'API',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Post', 'Comment', 'User', 'Category'],
    endpoints: (build) => ({
        init: build.query({
            query: (data) => ({
                url: '/auth/refresh-token'
            }),
            providesTags: result => ['User']
        }),
        login: build.mutation({
            query: (data) => ({
                url: '/auth/login',
                method: "POST",
                body: data
            }),
            invalidatesTags: ['User', 'Post']
        }),
        logout: build.mutation({
            query: (data) => ({
                url: '/auth/logout',
                method: "POST"
            }),
            invalidatesTags: ['User', 'Post']
        }),
        register: build.mutation({
            query: (data) => ({
                url: '/auth/register',
                method: "POST",
                body: data
            })
        }),
        getUser: build.query({
            query: (data) => ({
                url: `/users/${data}`
            }),
            providesTags: result => ['User']
        }),
        avatarUpdate: build.mutation({
            query: (data) => ({
                url: '/users/avatar',
                method: "PATCH",
                body: data
            }),
            invalidatesTags: ['User']
        }),
        userUpdate: build.mutation({
            query: (data) => ({
                url: `/users/${data.id}`,
                method: "PATCH",
                body: data.form
            }),
            invalidatesTags: ['User']
        }),
        createPost: build.mutation({
            query: (data) => ({
                url: '/posts',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Post']
        }),
        updatePost: build.mutation({
            query: (data) => ({
                url: `/posts/${data.id}`,
                method: 'PATCH',
                body: data.content
            }),
            invalidatesTags: ['Post']
        }),
        deletePost: build.mutation({
            query: (data) => ({
                url: `/posts/${data}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Post']
        }),
        getPosts: build.query({
            query: (data) => ({
                url: '/posts',
                params: {
                    date_sort: data.date_sort,
                    like: data.like_sort,
                    page: data.page
                }
            }),
            providesTags: result => ['Post']
        }),
        getOnePost: build.query({
            query: (data) => ({
                url: `/posts/${data}`,
            }),
            providesTags: result => ['Post']
        }),
        createComment: build.mutation({
            query: (data) => ({
                url: `/posts/${data.id}/comments`,
                method: "POST",
                body: data.content
            }),
            invalidatesTags: ['Comment']
        }),
        getComments: build.query({
            query: (data) => ({
                url: `/posts/${data}/comments`,
            }),
            providesTags: result => ['Comment']
        }),
        getCategories: build.query({
            query: (data, limit = 30) => ({
                url: `/categories`,
                params: { limit: limit }
            }),
            providesTags: result => ['Category']
        }),
        createCategory: build.mutation({
            query: (data) => ({
                url: `/categories`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ['Category']
        }),
        deleteCategory: build.mutation({
            query: (data) => ({
                url: `/categories/${data}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Category', 'Post']
        }),
        createLike: build.mutation({
            query: (data) => ({
                url: `/posts/${data}/like`,
                method: "POST",
            }),
            invalidatesTags: ['Post', 'User']
        }),
        deleteLike: build.mutation({
            query: (data) => ({
                url: `/posts/${data}/like`,
                method: "DELETE",
            }),
            invalidatesTags: ['Post', 'User']
        }),
        getCommentLikes: build.query({
            query: (data) => ({
                url: `/comments/${data}/like`,
            }),
            providesTags: result => ['Post', 'Comment']
        }),
        createCommentLike: build.mutation({
            query: (data) => ({
                url: `/comments/${data}/like`,
                method: "POST",
            }),
            invalidatesTags: ['Post', 'User', 'Comment']
        }),
        deleteCommentLike: build.mutation({
            query: (data) => ({
                url: `/comments/${data}/like`,
                method: "DELETE",
            }),
            invalidatesTags: ['Post', 'User', 'Comment']
        }),
    })
})