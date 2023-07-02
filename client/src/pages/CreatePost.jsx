import React from "react";
import { API } from "../services/APIService";
import '../styles/CreatePost.css'
import CategoriesContainer from "../components/CategoriesContainer";

const CreatePost = () => {

    const [create, { error, isSuccess, isError }] = API.useCreatePostMutation();
    const { data, isLoading, error: cat_err } = API.useGetCategoriesQuery();
    let categories = [];

    const add_category = ({ e, category }) => {
        if (e.currentTarget.style.backgroundColor != "rgb(208, 227, 241)") {
            e.currentTarget.style.backgroundColor = "hsl(205,53%,88%)";
            categories.push(category.id);
        } else {
            e.currentTarget.style.backgroundColor = "hsl(205,46%,92%)";
            const index = categories.findIndex((id) => id === category.id);
            categories.splice(index, 1);
        }
    }

    const create_handler = async (e) => {
        e.preventDefault();
        let data = new FormData(e.target);
        data.append("categories", JSON.stringify(categories));
        await create(data);
    }

    return (
        <div className="create_page">
            <form className="create_post" onSubmit={create_handler}>
                <input name="title" type="text" placeholder="Title" required />
                <textarea name="content" cols="30" rows="5" placeholder="Content" required></textarea>
                <button type="submit">Create</button>
                {isSuccess && <span>Success</span>}
                {isError && <span>{error.data.message}</span>}
            </form>
            <div>
                {isLoading && <h1>Идёт загрузка...</h1>}
                {cat_err && <h1>{cat_err.data.message}</h1>}
                {data &&
                    <CategoriesContainer handler={add_category} categories={data} description={true} />
                }
            </div>
        </div>
    );
};

export default CreatePost;