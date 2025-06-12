import React, { useState } from "react";
import Swal from "sweetalert2";
import { editProfile } from "../server/user-service";

const EditProfile = () => {
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { id } = useParams("id");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleEditProfile = async () => {
    try {
      if (name && email && password && avatar) {
        if (password.length >= 8) {
          const res = await editProfile(id, name, email, password, avatar);
          if (res.status === 200) {
            Swal.fire({
              title: "Berhasil edit profile!",
              icon: "success",
              text: `Berhasil edit profile akun `,
            });
          }
          else {
            Swal.fire({
              title: "Oops..Terjadi kesalahan!",
              icon: "error",
              text: `Error: ${res.message || `Terjadi kesalahan saat edit profile`}`,
            });
          }
        } else {
          Swal.fire({
            title: "Oops..Terjadi kesalahan",
            icon: "error",
            text: "Password minimal harus terdiri dari 8 karakter",
          });
        }
      } else {
        Swal.fire({
          title: "Oops!",
          text: "Semua field wajib diisi.",
          icon: "error",
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Edit Profil
        </h2>

        <div className="space-y-5">
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm shadow-inner">
                No Image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-2 text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Nama
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password Baru
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleEditProfile}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
