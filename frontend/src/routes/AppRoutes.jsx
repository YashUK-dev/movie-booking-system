import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import MovieDetails from '../pages/MovieDetails';
import SeatSelection from '../pages/SeatSelection';
import BookingPayment from '../pages/BookingPayment';
import BookingConfirmation from '../pages/BookingConfirmation';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MainLayout from '../layouts/MainLayout';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="movies/:id" element={<MovieDetails />} />
        <Route path="shows/:id/seats" element={<SeatSelection />} />
        <Route path="booking/:showId/payment" element={<BookingPayment />} />
        <Route path="booking/:bookingId/confirmation" element={<BookingConfirmation />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
