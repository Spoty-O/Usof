import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { API } from "../services/APIService";
import { logOut, setCredentials } from "../services/authSlice";
import '../styles/NavBar.css';
import { MAIN_PAGE, USER_PAGE, CREATE_PAGE, CATEGORY_PAGE } from '../utils/consts'

const NavBar = () => {

    let [open, setOpen] = useState(false);
    const { isAuth, profile_picture, id } = useSelector(state => state.authReducer);


    return (
        <header>
            <div>
                <Link to={MAIN_PAGE} className="header_links">
                    <div className="header_div logo">
                        <i className="fa-solid fa-brain header_hover"></i>
                        <span className="header_hover">Answer4you</span>
                    </div>
                </Link>
                <Link to={CATEGORY_PAGE} className="header_links header_hover">Categories</Link>
                {isAuth && <Link to={CREATE_PAGE} className="header_links header_hover">Create post</Link>}
            </div>
            <div>
                <div className="header_div profile header_hover" onClick={() => { setOpen(!open) }}>
                    <img src={isAuth ? `http://localhost:5000/${profile_picture}` : `http://localhost:5000/anon.jpg`} alt="" />
                    <i className="fa-solid fa-sort-down"></i>
                </div>
                {open &&
                    (isAuth
                        ? <ProfileBar id={id} />
                        : <Auth />)
                }
            </div>
        </header>
    )
};

const Auth = () => {
    const [formState, setForm] = useState(true);
    const [login, { data: log_data, error: log_er }] = API.useLoginMutation();
    const [register, { data, error: reg_er }] = API.useRegisterMutation();
    const dispatch = useDispatch();

    async function login_handler(e) {
        e.preventDefault();
        let res = await login(new FormData(e.target))
        console.log(res)
        dispatch(setCredentials(res));
    }

    async function register_handler(e) {
        e.preventDefault();
        await register(new FormData(e.target));
    }

    return (
        <form className="dropdown" onSubmit={formState ? login_handler : register_handler}>
            <div className="triangle"></div>
            <input name="email" type="email" placeholder="Email" readOnly={false} required />
            <input name="login" type="text" placeholder="Login" required />
            <input name="password" type="password" placeholder="Password" required />
            {!formState && <input name="password_conf" type="password" placeholder="Confirm password" required />}
            <button type="submit">{formState
                ? "Log in"
                : "Sign up"
            }</button>
            {formState
                ?
                <>
                    {log_er ? <span style={{ color: "red" }}>{log_er.data.message}</span> : log_data && <span style={{ color: "green" }}>{log_data.message}</span>}
                </>
                :
                <>
                    {reg_er ? <span style={{ color: "red" }}>{reg_er.data.message}</span> : data && <span style={{ color: "green" }}>{data.message}</span>}
                </>
            }
            <Link onClick={() => { setForm(!formState) }}>
                {formState
                    ? "New user? Create account!"
                    : "Have account? Log in!"
                }
            </Link>
        </form>
    )
}

const ProfileBar = () => {

    const [logout] = API.useLogoutMutation();
    const { role, login, id, rating } = useSelector(state => state.authReducer);
    const dispatch = useDispatch();

    async function logout_handler(e) {
        e.preventDefault();
        await logout();
        dispatch(logOut());
    }

    return (
        <div className="dropdown">
            <>
                <div className="triangle"></div>
                <span>Signed in as <strong color="black">{login}</strong></span>
                <span>Role: {role}</span>
                <span>Rating: {rating}</span>
                <Link to={USER_PAGE + `/${id}`}>My profile</Link>
                <button onClick={logout_handler}>LogOut</button>
            </>
        </div>
    )
}

export default NavBar;