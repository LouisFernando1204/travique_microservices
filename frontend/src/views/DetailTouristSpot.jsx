/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTouristSpotById, createBooking } from "../server/booking-service";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { GrMoney } from "react-icons/gr";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { LuX } from "react-icons/lu";
import ReviewComponent from "../components/ReviewComponent";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

const ErrorMessage = ({ status, message }) => (
  <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
    <p className="text-xl font-bold">Oops! Terjadi Kesalahan</p>
    <p className="font-semibold mt-2">Status: {status || "Tidak Diketahui"}</p>
    <p className="font-semibold">Pesan: {message || "Gagal memuat data."}</p>
  </div>
);

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

function formatIndonesianTimestampWithDateFns(isoTimestamp) {
  const date = parseISO(isoTimestamp);
  const timeZone = "Asia/Jakarta";
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, "d MMMM yyyy", { locale: id });
}

const DetailTouristSpot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("user")).id; // GANTI INI

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [bookingStatus, setBookingStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    // ... (logika fetch detail spot tetap sama)
    const fetchSpotDetail = async () => {
      if (!id) return;
      setLoading(true);
      const response = await getTouristSpotById(id);
      if (response.status === 200) {
        setSpot(response.data);
        setLoading(false);
      } else {
        setError({
          status: response.status,
          message: response.message || "Gagal mengambil detail data.",
        });
        setLoading(false);
      }
    };
    fetchSpotDetail();
  }, [id]);

  const handleOpenModal = () => {
    setBookingDate(spot?.availableDates[0] || "");
    setNumberOfPeople(1);
    setBookingStatus({ loading: false, error: null, success: false });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (bookingStatus.loading) return;
    setIsModalOpen(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!bookingDate) {
      setBookingStatus({
        ...bookingStatus,
        error: "Silakan pilih tanggal booking.",
      });
      return;
    }

    setBookingStatus({ loading: true, error: null, success: false });

    // ================== PENTING: GANTI DENGAN LOCALSTORAGE ==================
    const userId = JSON.parse(localStorage.getItem("user")).id; // GANTI INI
    // const userId = "684acb6158a1a421ca8af1b9";
    const token = localStorage.getItem("token");
    // =========================================================================

    const bookingData = {
      userId,
      touristSpotId: id,
      bookingDate,
      numberOfPeople: parseInt(numberOfPeople, 10),
    };
      
      console.log(bookingData)
console.log(token)
    const response = await createBooking(bookingData, token);
    console.log("response:", response);

    if (response.status == 201) {
      setBookingStatus({ loading: false, error: null, success: true });
      alert("Booking berhasil dibuat!");
      handleCloseModal();
    } else {
      setBookingStatus({
        loading: false,
        error: response.message || "Terjadi kesalahan saat membuat booking.",
        success: false,
      });
    }
  };

  const totalPrice = spot ? spot.pricePerPerson * numberOfPeople : 0;

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="container mx-auto p-8">
        <ErrorMessage status={error.status} message={error.message} />
      </div>
    );
  if (!spot)
    return (
      <div className="text-center p-8">Tempat wisata tidak ditemukan.</div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/touristspots"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <IoIosArrowBack size={20} />
          <span>Kembali ke Daftar Wisata</span>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
              <img
                src={
                  spot.imageUrls[selectedImageIndex] ||
                  "https://via.placeholder.com/800x450.png?text=Gambar+Wisata"
                }
                alt={`Gambar utama ${spot.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {spot.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    selectedImageIndex === index ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
              {spot.name}
            </h1>
            <div className="flex items-center text-gray-600 mt-3">
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              <span className="text-lg">{spot.location}</span>
            </div>
            <p className="mt-6 text-gray-700 leading-relaxed">
              {spot.description}
            </p>
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <GrMoney className="text-blue-600 mr-4" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Harga per Orang</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatPrice(spot.pricePerPerson)}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BsFillCalendarDateFill className="text-blue-600" />
                  Tanggal Tersedia
                </h3>
                <ul className="mt-3 space-y-2">
                  {spot.availableDates.map((date) => (
                    <li
                      key={date}
                      className="text-gray-700 bg-blue-50 p-2 rounded-md"
                    >
                      {formatIndonesianTimestampWithDateFns(date)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={handleOpenModal}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 text-lg"
              >
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 transition-opacity"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-all"
            onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik di dalam
          >
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold text-blue-900">
                Formulir Booking
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <LuX size={28} />
              </button>
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="bookingDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pilih Tanggal
                  </label>
                  <select
                    id="bookingDate"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>
                      -- Pilih Tanggal Booking --
                    </option>
                    {spot.availableDates.map((date) => (
                      <option key={date} value={date}>
                        {formatIndonesianTimestampWithDateFns(date)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="numberOfPeople"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Jumlah Orang
                  </label>
                  <input
                    type="number"
                    id="numberOfPeople"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-blue-800">Total Harga</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
                {bookingStatus.error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center text-sm">
                    {bookingStatus.error}
                  </div>
                )}
              </div>
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={bookingStatus.loading}
                  className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {bookingStatus.loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Konfirmasi Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div>
        {/* Debug info (hapus di production) */}
        {/* <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p><strong>Debug Info:</strong></p>
                <p>Tourist Spot ID: {finalTouristSpotId}</p>
                <p>User ID: {currentUserId}</p>
                <p>Using: {touristSpotId ? 'URL Param' : 'Dummy'} tourist spot ID</p>
            </div> */}

        <ReviewComponent
          idTouristSpot={id} // Dari URL params atau dummy
          idUser={userId} // Dari localStorage atau dummy
        />
      </div>
    </div>
  );
};

export default DetailTouristSpot;
