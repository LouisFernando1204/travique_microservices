import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTouristSpots } from '../server/booking-service';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GrMoney } from "react-icons/gr";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

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

function formatIndonesianTimestampWithDateFns(isoTimestamp) {
    const date = parseISO(isoTimestamp);
    const timeZone = 'Asia/Jakarta';
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'd MMMM yyyy', { locale: id });
}

const TouristSpotCard = ({ spot, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    >
        <img
            className="w-full h-48 object-cover"
            src={spot.imageUrls[0] || 'https://via.placeholder.com/400x300.png?text=Gambar+Wisata'}
            alt={`Gambar ${spot.name}`}
        />
        <div className="p-5">
            <h3 className="text-xl font-bold text-blue-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                {spot.name}
            </h3>
            <div className="flex items-center text-gray-500 mt-2">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                <p className="text-sm">{spot.location}</p>
            </div>
            <div className="flex items-center text-gray-500 mt-2">
                <GrMoney className="mr-2 text-blue-500" />
                <p className="text-sm">{spot.pricePerPerson}</p>
            </div>
            {
                spot.availableDates.map((date) => (
                    <div
                        key={date}
                        className="flex items-center text-gray-500 mt-2">
                        <BsFillCalendarDateFill className="mr-2 text-blue-500" />
                        <p className="text-sm">{formatIndonesianTimestampWithDateFns(date)}</p>
                    </div>
                ))
            }
        </div>
    </div>
);

const TouristSpots = () => {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTouristSpots = async () => {
            setLoading(true);
            const response = await getAllTouristSpots();
            if (response.status == 200) {
                setSpots(response.data);
                setLoading(false);
            } else {
                setError({ status: response.status, message: response.message });
                setLoading(false);
            }
        };
        fetchTouristSpots();
    }, []);

    const handleCardClick = (id) => {
        navigate(`/touristspots/${id}`);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Temukan Destinasi Impianmu</h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
                        Jelajahi berbagai tempat wisata menarik yang siap menanti Anda.
                    </p>
                </div>
                {loading && <LoadingSpinner />}
                {error && <ErrorMessage status={error.status} message={error.message} />}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {spots.map((spot) => (
                            <TouristSpotCard
                                key={spot._id}
                                spot={spot}
                                onClick={() => handleCardClick(spot._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TouristSpots;