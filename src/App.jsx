import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";
import DisabledDashboard from "./pages/disabled/Dashboard";
import RequestHelp from "./pages/disabled/RequestHelp";
import EditRequest from "./pages/disabled/EditRequest";
import Doctors from "./pages/disabled/Doctors";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerRequestDetails from "./pages/volunteer/VolunteerRequestDetails";
import Chat from "./pages/volunteer/Chat";
import DisabledChat from "./pages/disabled/Chat";
import DisabledProfileView from "./pages/disabled/ProfileView";
import DisabledProfileEdit from "./pages/disabled/Profile";
import ProfileView from "./pages/volunteer/ProfileView";
import EditProfile from "./pages/volunteer/EditProfile";
import VolunteerInfo from "./pages/disabled/VolunteerInfo";

// أدمن
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDisabledUsers from "./pages/admin/AdminDisabledUsers";
import AdminVolunteers from "./pages/admin/AdminVolunteers";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminRatings from "./pages/admin/AdminRatings";
import AdminReports from "./pages/admin/AdminReports";

const AppLayout = () => {
  const location = useLocation();

  const hideLayout =
    location.pathname.startsWith("/disabled") ||
    location.pathname.startsWith("/volunteer") ||
    location.pathname.startsWith("/admin");

  return (
    <div className='flex flex-col min-h-screen' dir='rtl'>
      {!hideLayout && <Navbar />}

      <main className='flex-grow'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/admin/login' element={<AdminLogin />} />

          {/* لوحة الأدمن */}
          <Route path='/admin' element={<AdminLayout />}>
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='users/disabled' element={<AdminDisabledUsers />} />
            <Route path='users/volunteers' element={<AdminVolunteers />} />
            <Route path='requests' element={<AdminRequests />} />
            <Route path='ratings' element={<AdminRatings />} />
            <Route path='reports' element={<AdminReports />} />
          </Route>

          <Route path='/disabled/dashboard' element={<DisabledDashboard />} />
          <Route path='/disabled/request-help' element={<RequestHelp />} />
          <Route path='/disabled/edit-request/:id' element={<EditRequest />} />
          <Route path='/disabled/doctors' element={<Doctors />} />
          <Route path='/volunteer/dashboard' element={<VolunteerDashboard />} />
          <Route
            path='/volunteer/request/:id'
            element={<VolunteerRequestDetails />}
          />
          <Route path='/volunteer/chat/:requestId' element={<Chat />} />
          <Route path='/disabled/chat/:requestId' element={<DisabledChat />} />
          <Route path='/disabled/profile' element={<DisabledProfileView />} />
          <Route
            path='/disabled/profile/edit'
            element={<DisabledProfileEdit />}
          />
          <Route path='/volunteer/profile' element={<ProfileView />} />
          <Route path='/volunteer/profile/edit' element={<EditProfile />} />
          <Route
            path='/disabled/volunteer-info/:requestId'
            element={<VolunteerInfo />}
          />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppLayout />
  </BrowserRouter>
);

export default App;
