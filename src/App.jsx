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
import VolunteerProfile from "./pages/volunteer/VolunteerProfile";
import VolunteerRequestDetails from "./pages/volunteer/VolunteerRequestDetails";

// مكوّن داخلي عشان useLocation يشتغل صح
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
          <Route path='/disabled/dashboard' element={<DisabledDashboard />} />
          <Route path='/disabled/request-help' element={<RequestHelp />} />
          <Route path='/disabled/edit-request/:id' element={<EditRequest />} />
          <Route path='/disabled/doctors' element={<Doctors />} />
          <Route path='/volunteer/dashboard' element={<VolunteerDashboard />} />
          <Route path='/volunteer/profile' element={<VolunteerProfile />} />
          <Route
            path='/volunteer/request/:id'
            element={<VolunteerRequestDetails />}
          />
          ;
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
