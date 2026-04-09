// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Campaign from "./pages/Campaign";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import ActiveRides from "./pages/activerides";
import RideDetails from "./pages/RideDetails";
import CreateRide from "./pages/CreateRide";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import RideActive from "./pages/RideActive";
import LiveCampaign from "./pages/LiveCampaign";
import CommunityChat from "./pages/CommunityChat";
import Chat from "./pages/chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateCommunity from "./pages/CreateCommunity";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Login page opens first */}
        <Route path="/" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/campaign" element={token ? <Campaign /> : <Navigate to="/login" />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
        <Route path="/live-campaign" element={<LiveCampaign />} />
        <Route path="/campaign-details" element={<CampaignDetails />} />
        <Route path="/ride-active" element={<RideActive />} />
        <Route path="/ride-active/:id" element={<RideActive />} />
        <Route path="/community" element={token ? <Community /> : <Navigate to="/login" />} />
        <Route path="/create-community" element={token ? <CreateCommunity /> : <Navigate to="/login" />} />
        <Route path="/community-chat" element={<CommunityChat />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/active" element={token ? <ActiveRides /> : <Navigate to="/login" />} />
        <Route path="/ride/:id" element={token ? <RideDetails /> : <Navigate to="/login" />} />
        <Route path="/create-ride" element={token ? <CreateRide /> : <Navigate to="/login" />} />
        <Route path="/chat/:id" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token ? <AdminPanel /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;