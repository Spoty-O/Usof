import React from "react";
import { Routes, Route } from 'react-router-dom'
import { allRoutes } from "../routes";

const AppRouter = () => {
    return (
        <Routes>
            {allRoutes.map(({ path, Component }) => {
                return <Route key={path} path={path} element={Component} exact />
            })}
            <Route path="*" element={allRoutes[0].Component}></Route>
        </Routes>
    );
};

export default AppRouter;