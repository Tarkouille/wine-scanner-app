import React, { useState, useEffect, useRef } from "react";
import Quagga from "quagga";
import Tesseract from "tesseract.js";

const WineScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [wineData, setWineData] = useState(null);
  const [image, setImage] = useState(null);
  const [textResult, setTextResult] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: {
              facingMode: "environment",
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
            },
            target: scannerRef.current,
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_128_reader",
            ],
          },
          locate: true,
          numOfWorkers: navigator.hardwareConcurrency || 4,
        },
        (err) => {
          if (err) {
            console.error("Erreur Quagga:", err);
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

    return () => {
      Quagga.stop();
    };
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        processImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData) => {
    setTextResult("Analyse en cours...");
    const { data: { text } } = await Tesseract.recognize(imageData, "eng");
    setTextResult(text);
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">🍷 Bienvenue chez les amateurs de vin</h1>
      <p className="text-gray-600 mb-2">Scannez un code-barres ou prenez une photo d'une étiquette.</p>
      
      <div className="relative w-full max-w-xs h-40 border-2 border-gray-400 rounded-lg overflow-hidden mb-4">
        <div ref={scannerRef} className="absolute inset-0 w-full h-full bg-black opacity-70"></div>
        <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm">Dirigez l’appareil photo vers le code-barres</p>
      </div>

      {barcode && <p className="mt-4 text-green-500 font-bold text-lg">✅ Code détecté : {barcode}</p>}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mt-4 border p-2 w-full cursor-pointer"
      />

      {image && (
        <div className="mt-4">
          <img src={image} alt="Étiquette uploadée" className="w-32 mx-auto border rounded-lg" />
          <p className="text-gray-600 mt-2">🔍 Texte détecté :</p>
          <p className="text-gray-800 font-bold">{textResult}</p>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        Scanner un autre vin
      </button>
    </div>
  );
};

export default WineScanner;
