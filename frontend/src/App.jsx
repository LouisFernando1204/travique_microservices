import { useState } from "react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import EditProfile from "./views/EditProfile";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit_profile/:id" element={<EditProfile />} />
      </Routes>
    </>
  );
}

export default App;
