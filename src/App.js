import React from "react";
import WineScanner from "./components/WineScanner"; // ✅ J'importe le composant WineScanner

function App() {
  return (
    <div>
      <h1>Application de Scan de Vin 🍷</h1>
      <WineScanner /> {/* ✅ J'affiche le composant ici */}
    </div>
  );
}

export default App;
