import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { API } from "../services/APIService";
import '../styles/UserPage.css'
import getFormattedDate from "../utils/time";

const UserPage = () => {

    const { id: id_user } = useParams();
    const { id, role, isAuth } = useSelector(state => state.authReducer);
    const { data, isLoading, error } = API.useGetUserQuery(id_user);
    const [update_av] = API.useAvatarUpdateMutation();
    const [update, { error: error_update }] = API.useUserUpdateMutation();
    let [form, setForm] = useState(false);

    const update_data = async (e) => {
        e.preventDefault();
        let form = new FormData(e.target)
        await update_av(form);
        await update({ id: data.id, form });
        setForm(!form);
    }

    return (
        <div className="profile_container">
            {isLoading && <h1>Идёт загрузка...</h1>}
            {error && <h1>{error.data.message}</h1>}
            {data &&
                <div className="profile">
                    <img src={`http://localhost:5000/${data.profile_picture}`} alt="" onClick={() => setForm(!form)} />
                    {isAuth && (id == id_user || role == 'ADMIN') && form ?
                        <form onSubmit={update_data} encType="multipart/form-data">
                            {id == id_user
                                ?
                                <>
                                    <input type="file" name="img" accept="image/*" />
                                    <input type="text" name="login" defaultValue={data.login} required />
                                </>
                                :
                                <span>{data.login}</span>
                            }
                            {role == 'ADMIN'
                                ?
                                <>
                                    <select name="role" defaultValue={data.role}>
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </>
                                :
                                <span>Role: {data.role}</span>
                            }
                            <button type="submit">Change</button>
                            {error_update && <span style={{ color: "red" }}>{error_update.data.message}</span>}
                        </form>
                        :
                        <>
                            <span>{data.login}</span>
                            <span>Role: {data.role}</span>
                        </>
                    }
                    <span>Rating: {data.rating}</span>
                    <span>With us from: {getFormattedDate(data.createdAt)}</span>
                </div>
            }
        </div>
    );
};

export default UserPage;