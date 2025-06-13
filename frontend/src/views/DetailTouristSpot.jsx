/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTouristSpotById, createBooking } from '../server/booking-service';
import { createPayment } from '../server/payment-service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { GrMoney } from 'react-icons/gr';
import { BsFillCalendarDateFill } from 'react-icons/bs';
import { IoIosArrowBack } from "react-icons/io";
import { LuX } from "react-icons/lu";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
    </div>
);

const ErrorMessage = ({ status, message }) => (
    <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
        <p className="text-xl font-bold">Oops! Terjadi Kesalahan</p>
        <p className="font-semibold mt-2">Status: {status || 'Tidak Diketahui'}</p>
        <p className="font-semibold">Pesan: {message || 'Gagal memuat data.'}</p>
    </div>
);

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
};

function formatIndonesianTimestampWithDateFns(isoTimestamp) {
    const date = parseISO(isoTimestamp);
    const timeZone = 'Asia/Jakarta';
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'd MMMM yyyy', { locale: id });
}

const DetailTouristSpot = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [spot, setSpot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [bookingStatus, setBookingStatus] = useState({ loading: false, error: null, success: false });

    // State untuk payment
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    useEffect(() => {
        const fetchSpotDetail = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await getTouristSpotById(id);
                if (response.status === 200) {
                    setSpot(response.data);
                } else {
                    setError({ status: response.status, message: response.message || 'Gagal mengambil detail data.' });
                }
            } catch (err) {
                console.error('Error fetching spot detail:', err);
                setError({ status: 'Error', message: 'Terjadi kesalahan saat mengambil data.' });
            } finally {
                setLoading(false);
            }
        };
        fetchSpotDetail();
    }, [id]);

    useEffect(() => {
        const loadMidtransScript = () => {
            if (window.snap) {
                console.log('Midtrans Snap already loaded');
                return;
            }

            const existingScript = document.querySelector('script[src*="snap.js"]');
            if (existingScript) {
                console.log('Midtrans script already exists');
                return;
            }

            const clientKey = 'SB-Mid-client-c_3MSNu5wCIgRJW5';

            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', clientKey);
            script.async = true;

            script.onload = () => {
                console.log('Midtrans Snap script loaded successfully');
            };

            script.onerror = (error) => {
                console.error('Failed to load Midtrans Snap script:', error);
            };

            document.head.appendChild(script);
        };

        loadMidtransScript();

        // Cleanup function
        return () => {
            // Tidak menghapus script karena mungkin digunakan di komponen lain
        };
    }, []);

    const handleOpenModal = () => {
        setBookingDate(spot?.availableDates[0] || '');
        setNumberOfPeople(1);
        setBookingStatus({ loading: false, error: null, success: false });
        setPaymentError(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (bookingStatus.loading || paymentLoading) return;
        setIsModalOpen(false);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!bookingDate) {
            setBookingStatus({ ...bookingStatus, error: 'Silakan pilih tanggal booking.' });
            return;
        }

        setBookingStatus({ loading: true, error: null, success: false });
        setPaymentError(null);

        try {
            // Validasi localStorage dengan error handling
            const userStr = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!userStr || !token) {
                setBookingStatus({
                    loading: false,
                    error: 'Silakan login terlebih dahulu.',
                    success: false
                });
                return;
            }

            let userId;
            try {
                const user = JSON.parse(userStr);
                userId = user.id;
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                setBookingStatus({
                    loading: false,
                    error: 'Data user tidak valid. Silakan login ulang.',
                    success: false
                });
                return;
            }

            const bookingData = {
                userId,
                touristSpotId: id,
                bookingDate,
                numberOfPeople: parseInt(numberOfPeople, 10),
            };

            console.log('Sending booking data:', bookingData);
            const bookingResponse = await createBooking(bookingData, token);
            console.log("Booking response:", bookingResponse);

            if (bookingResponse.status === 201) {
                setBookingStatus({ loading: false, error: null, success: true });

                const bookingId = bookingResponse.data.bookingId || bookingResponse.data.id;
                if (bookingId) {
                    await processPayment(bookingId, token, userId);
                } else {
                    setPaymentError('Booking ID tidak ditemukan. Silakan coba lagi.');
                }
            } else {
                setBookingStatus({
                    loading: false,
                    error: bookingResponse.message || 'Terjadi kesalahan saat membuat booking.',
                    success: false
                });
            }
        } catch (error) {
            console.error("Booking error:", error);
            setBookingStatus({
                loading: false,
                error: 'Terjadi kesalahan yang tidak terduga: ' + error.message,
                success: false
            });
        }
    };

    const processPayment = async (bookingId, token) => {
        setPaymentLoading(true);
        setPaymentError(null);
        const userStr = localStorage.getItem("user");
        let userId;
        const user = JSON.parse(userStr);
        userId = user.id;
        const totalAmount = spot.pricePerPerson * numberOfPeople;
        const paymentData = {
            bookingId: bookingId,
            amount: totalAmount,
            userId: userId
        };
        console.log(paymentData);

        try {
            console.log('Creating payment with data:', paymentData);
            const paymentResponse = await createPayment(paymentData, token);
            console.log("Payment response:", paymentResponse);

            if (paymentResponse.status === 201) {
                const responseData = paymentResponse.data;
                const snapToken = responseData.snapToken || responseData.data?.snapToken;

                if (!snapToken) {
                    setPaymentError('Token pembayaran tidak ditemukan. Silakan coba lagi.');
                    return;
                }

                setTimeout(() => {
                    if (window.snap) {
                        console.log('Opening Midtrans payment with token:', snapToken);
                        window.snap.pay(snapToken, {
                            onSuccess: function (result) {
                                console.log('Payment success:', result);
                                alert('Pembayaran berhasil!');
                                setIsModalOpen(false);
                                navigate('/bookings');
                            },
                            onPending: function (result) {
                                console.log('Payment pending:', result);
                                alert('Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.');
                                setIsModalOpen(false);
                                // Redirect ke halaman pending payment
                                navigate('/bookings');
                            },
                            onError: function (result) {
                                console.log('Payment error:', result);
                                setPaymentError('Pembayaran gagal. Silakan coba lagi.');
                            },
                            onClose: function () {
                                console.log('Payment popup closed');
                                setPaymentError('Pembayaran dibatalkan oleh pengguna.');
                            }
                        });
                    } else {
                        setPaymentError('Gateway pembayaran belum siap. Silakan refresh halaman dan coba lagi.');
                        console.error('Midtrans Snap not available');
                    }
                }, 500);
            } else {
                setPaymentError(paymentResponse.message || 'Gagal membuat pembayaran.');
            }
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentError('Terjadi kesalahan saat memproses pembayaran: ' + error.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const totalPrice = spot ? spot.pricePerPerson * numberOfPeople : 0;

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container mx-auto p-8"><ErrorMessage status={error.status} message={error.message} /></div>;
    if (!spot) return <div className="text-center p-8">Tempat wisata tidak ditemukan.</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link to="/touristspots" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6">
                    <IoIosArrowBack size={20} />
                    <span>Kembali ke Daftar Wisata</span>
                </Link>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                    <div className="lg:col-span-3">
                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={spot.imageUrls[selectedImageIndex] || 'https://via.placeholder.com/800x450.png?text=Gambar+Wisata'}
                                alt={`Gambar utama ${spot.name}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {spot.imageUrls.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">{spot.name}</h1>
                        <div className="flex items-center text-gray-600 mt-3">
                            <FaMapMarkerAlt className="mr-2 text-blue-500" />
                            <span className="text-lg">{spot.location}</span>
                        </div>
                        <p className="mt-6 text-gray-700 leading-relaxed">{spot.description}</p>
                        <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <GrMoney className="text-blue-600 mr-4" size={24} />
                                <div>
                                    <p className="text-sm text-gray-500">Harga per Orang</p>
                                    <p className="text-2xl font-bold text-blue-800">{formatPrice(spot.pricePerPerson)}</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <BsFillCalendarDateFill className="text-blue-600" />
                                    Tanggal Tersedia
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {spot.availableDates.map(date => (
                                        <li key={date} className="text-gray-700 bg-blue-50 p-2 rounded-md">
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

            {/* Booking & Payment Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 transition-opacity"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-all max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-blue-900">
                                {bookingStatus.success ? 'Proses Pembayaran' : 'Formulir Booking'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                                disabled={bookingStatus.loading || paymentLoading}
                            >
                                <LuX size={28} />
                            </button>
                        </div>

                        {!bookingStatus.success ? (
                            // Form Booking
                            <form onSubmit={handleBookingSubmit}>
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">
                                            Pilih Tanggal
                                        </label>
                                        <select
                                            id="bookingDate"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            disabled={bookingStatus.loading}
                                        >
                                            <option value="" disabled>-- Pilih Tanggal Booking --</option>
                                            {spot.availableDates.map(date => (
                                                <option key={date} value={date}>
                                                    {formatIndonesianTimestampWithDateFns(date)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 mb-2">
                                            Jumlah Orang
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfPeople"
                                            value={numberOfPeople}
                                            onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                                            min="1"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            disabled={bookingStatus.loading}
                                        />
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
                                        <p className="text-sm text-blue-800 font-medium">Total Harga</p>
                                        <p className="text-3xl font-bold text-blue-900 mt-1">{formatPrice(totalPrice)}</p>
                                    </div>
                                    {bookingStatus.error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                                            <p className="font-medium">❌ {bookingStatus.error}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8">
                                    <button
                                        type="submit"
                                        disabled={bookingStatus.loading}
                                        className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {bookingStatus.loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                                                Memproses...
                                            </>
                                        ) : (
                                            'Konfirmasi Booking & Bayar'
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // Payment Status
                            <div className="text-center space-y-6">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-green-800 font-semibold text-lg">✅ Booking Berhasil!</p>
                                    <p className="text-sm text-green-600 mt-2">Booking telah dibuat, silakan lanjutkan pembayaran</p>
                                </div>

                                {paymentLoading && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex justify-center items-center space-x-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                            <p className="text-blue-800 font-medium">Menyiapkan gateway pembayaran...</p>
                                        </div>
                                    </div>
                                )}

                                {paymentError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                                        <p className="font-medium">❌ {paymentError}</p>
                                        <button
                                            onClick={() => {
                                                setPaymentError(null);
                                                const bookingId = '684babae56822b0716d3de44';
                                                const token = localStorage.getItem("token");
                                                processPayment(bookingId, token);
                                            }}
                                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Coba Lagi
                                        </button>
                                    </div>
                                )}

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 font-medium">Total Pembayaran</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{formatPrice(totalPrice)}</p>
                                </div>

                                {!paymentLoading && !paymentError && (
                                    <div className="text-sm text-gray-500">
                                        <p>Jika pembayaran tidak muncul otomatis, silakan refresh halaman</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailTouristSpot;