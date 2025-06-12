import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import React from "react";
import { login } from "../server/user-service";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (email && password) {
        if (password.length < 8) {
          Swal.fire({
            title: "Oops..Terjadi kesalahan",
            icon: "error",
            text: "Password minimal harus terdiri dari 8 karakter",
          });
        } else {
          const res = await login(email, password);
          // console.log(res.data.data.user);
          // console.log(res.data.data.jwt);
          if (res.status === 201) {
            sessionStorage.setItem("user", res.data.data.user);
            sessionStorage.setItem("token", res.data.data.jwt);
            Swal.fire({
              title: "Berhasil Login!",
              icon: "success",
              text: `Berhasil login sebagai ${res.data.data.user.email}`,
              timer: 2000,
            });
            setTimeout(() => {
              navigate(`/edit_profile/${res.data.data.user.id}`);
            }, 2000);
          } else {
            Swal.fire({
              title: "Oops..Terjadi kesalahan!",
              icon: "error",
              text: `Error: ${res.message || `Terjadi kesalahan saat login`}`,
            });
          }
        }
      } else {
        Swal.fire({
          title: "Oops..Terjadi kesalahan",
          icon: "error",
          text: "Semua field wajib diisi!",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Oops..Terjadi kesalahan",
        icon: "error",
        text: `${error.message}`,
      });
    }
  };

  return (
    <AuthLayout title="Welcome Back">
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Login
        </button>
        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
