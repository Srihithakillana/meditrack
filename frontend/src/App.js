import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import PrescriptionDetail from "./pages/PrescriptionDetail";
import PrescriptionEdit from "./pages/PrescriptionEdit";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* DASHBOARD GROUP: These share the Sidebar Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>

          {/* FOCUS GROUP: These are FULL SCREEN (No Sidebar) to feel like new pages */}
          <Route path="/prescription/:patientName/:id" element={<ProtectedRoute><PrescriptionDetail /></ProtectedRoute>} />
          <Route path="/admin/edit/:id" element={<ProtectedRoute><PrescriptionEdit /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;