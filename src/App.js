import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import DetailScreen from "./screens/DetailScreen";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/details/:id" element={<DetailScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
