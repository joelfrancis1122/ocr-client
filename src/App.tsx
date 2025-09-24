import { BrowserRouter, Routes, Route } from "react-router-dom";
import OcrPage from "./pages/ocr";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OcrPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
