import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import TouristSpot from "./views/TouristSpots";
import DetailTouristSpot from "./views/DetailTouristSpot";
import Review from "./views/Review";
import EditProfile from "./views/EditProfile";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/touristspots" element={<TouristSpot />} />
        <Route path="/touristspots/:id" element={<DetailTouristSpot />} />
        <Route path="/review" element={<Review />} />
        <Route path="/edit_profile/:id" element={<EditProfile />} />
      </Routes>
    </>
  );
}

export default App;