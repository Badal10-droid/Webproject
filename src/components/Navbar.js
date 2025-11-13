import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#f4f4f4" }}>
      <Link to="/" style={{ marginRight: "15px" }}>Dashboard</Link>
      <Link to="/income" style={{ marginRight: "15px" }}>Income</Link>
      <Link to="/expense">Expense</Link>
    </nav>
  );
}