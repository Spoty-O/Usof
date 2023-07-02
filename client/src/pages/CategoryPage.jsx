import React from "react";
import CategoriesContainer from "../components/CategoriesContainer";
import { API } from "../services/APIService";
import { useSelector } from "react-redux";
import '../styles/CategoryPage.css'

const CategoryPage = () => {

    const [create, { isSuccess, error }] = API.useCreateCategoryMutation();
    const [delete_category, { }] = API.useDeleteCategoryMutation();
    const { data, isLoading, error: cat_err } = API.useGetCategoriesQuery();
    const { role } = useSelector(state => state.authReducer);

    const delete_handler = ({ category }) => {
        if (role != 'ADMIN') return;
        delete_category(category.id);
    }

    const create_hanlder = (e) => {
        e.preventDefault();
        create(new FormData(e.target))
    }

    return (
        <div className="page_categor_container">
            {role == "ADMIN" &&
                <form className="create_category_form" onSubmit={create_hanlder}>
                    <input type="text" name="title" placeholder="Title" required />
                    <textarea name="description" cols="30" rows="5" placeholder="Description" required></textarea>
                    <button type="submit">Create</button>
                    {isSuccess && <span>Success</span>}
                    {error && <span>{error.data.message}</span>}
                </form>
            }
            <div>
                {isLoading && <h1>Идёт загрузка...</h1>}
                {cat_err && <h1>{cat_err.data.message}</h1>}
                {data &&
                    <CategoriesContainer handler={delete_handler} categories={data} description={true} />
                }
            </div>
        </div>
    );
};

export default CategoryPage;