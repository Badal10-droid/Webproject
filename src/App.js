import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";   // Navbar import
import Dashboard from "./pages/Dashboard";  // Page imports
import IncomePage from "./pages/IncomePage";
import ExpensePage from "./pages/ExpensePage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expense" element={<ExpensePage />} />
      </Routes>
    </Router>
  );
}

export default App;
 