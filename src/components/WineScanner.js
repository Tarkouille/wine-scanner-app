import React, { useState, useEffect, useRef } from "react";
import Quagga from "quagga";

const WineScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [wineData, setWineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState({});
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: scannerRef.current,
          },
          decoder: {
            readers: ["ean_13_reader"],
          },
        },
        (err) => {
          if (err) {
            console.error("Erreur lors de l'initialisation du scanner", err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((data) => {
        setBarcode(data.codeResult.code);
        Quagga.stop();
      });
    }
  }, []);

  const fetchWineInfo = async () => {
    if (!barcode) return;
    setLoading(true);
    setError(null);
    setWineData(null);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1) {
        setWineData(data.product);
      } else {
        setError("Vin non trouvé.");
      }
    } catch (err) {
      setError("Erreur lors de la récupération des données.");
    }
    
    setLoading(false);
  };

  const saveReview = () => {
    if (!wineData) return;
    setReviews((prev) => ({
      ...prev,
      [barcode]: { rating, review },
    }));
    setReview("");
    setRating(0);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Bienvenue chez les amateurs de vin 🍷</h1>
      <div ref={scannerRef} className="w-full h-48 bg-gray-200" />
      <p className="text-center text-gray-500">Dirigez l’appareil photo vers le code-barres</p>
      <input
        type="text"
        placeholder="Ou entrez un code-barres"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        className="border p-2 w-full mt-2"
      />
      <button
        onClick={fetchWineInfo}
        className="bg-blue-500 text-white p-2 mt-2 w-full"
      >
        Rechercher
      </button>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {wineData && (
        <div className="mt-4 p-4 border">
          <h2 className="text-lg font-bold">{wineData.product_name || "Nom inconnu"}</h2>
          <p><strong>Marque:</strong> {wineData.brands || "Non spécifié"}</p>
          {wineData.image_url && <img src={wineData.image_url} alt="Étiquette" className="mt-2 w-32" />}
          
          {/* Avis & Note */}
          <div className="mt-4">
            <label className="block font-bold">Note :</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border p-2 w-full">
              <option value={0}>Sélectionnez une note</option>
              <option value={1}>⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={5}>⭐⭐⭐⭐⭐</option>
            </select>
            <label className="block font-bold mt-2">Avis :</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="border p-2 w-full"
              placeholder="Donnez votre avis sur ce vin..."
            />
            <button onClick={saveReview} className="bg-green-500 text-white p-2 mt-2 w-full">
              Enregistrer l'avis
            </button>
          </div>
          
          {/* Affichage des avis */}
          {reviews[barcode] && (
            <div className="mt-4 p-4 border-t">
              <h3 className="font-bold">Votre avis :</h3>
              <p>Note : {"⭐".repeat(reviews[barcode].rating)}</p>
              <p>{reviews[barcode].review}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WineScanner;
