import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import React from "react";
import Swal from "sweetalert2";
import { pinata, register } from "../server/user-service";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate()

  const handleRegister = async () => {
    const uploadAvatar = await pinata.upload.public.file(avatar);
    const avatarUrl = `https://gateway.pinata.cloud/ipfs/${uploadAvatar.cid}`;

    try {
      if (name && email && password && avatar) {
        const res = await register(name, email, password, avatarUrl);
        if (password.length < 8) {
          Swal.fire({
            title: "Oops..Terjadi kesalahan",
            icon: "error",
            text: "Password minimal harus terdiri dari 8 karakter",
          });
        } else {
          // console.log(res.data.data.user);
          // console.log(res.data.data.jwt);
          if (res.status === 201) {
            localStorage.setItem("user", JSON.stringify(res.data.data.user));
            localStorage.setItem("token", res.data.data.jwt);
            Swal.fire({
              title: "Berhasil register!",
              icon: "success",
              text: `Berhasil registrasi akun ${res.data.data.user.email}`,
              timer: 2000,
            });
            setTimeout(() => {
              navigate(`/edit_profile/${res.data.data.user.id}`);
            }, 2000);
          } else {
            Swal.fire({
              title: "Oops..Terjadi kesalahan!",
              icon: "error",
              text: `Error: ${
                res.message || `Terjadi kesalahan saat register`
              }`,
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
    <AuthLayout title="Create Account">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          required
        />
        <button
          type="submit"
          onClick={handleRegister}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Register
        </button>
        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
