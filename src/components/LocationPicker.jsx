import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "../utils/leafletIcon";

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
};

const LocationMarker = ({ position, setPosition, setLocationText }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      reverseGeocode(lat, lng, setLocationText);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

const reverseGeocode = async (lat, lng, setLocationText) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
    const data = await res.json();
    setLocationText(
      data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    );
  } catch {
    setLocationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }
};

const LocationPicker = ({
  position,
  setPosition,
  locationText,
  setLocationText,
}) => {
  const [geoError, setGeoError] = useState("");

  const useCurrentLocation = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        reverseGeocode(lat, lng, setLocationText);
      },
      () => {
        setGeoError(
          "تعذر الحصول على موقعك. فعّلي الإذن أو حددي الموقع من الخريطة.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const center = position ? [position.lat, position.lng] : [24.7136, 46.6753]; // الرياض افتراضياً

  return (
    <div className='space-y-3'>
      <div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
        <label className='block text-sm font-medium text-slate-700'>
          تحديد الموقع على الخريطة <span className='text-red-500'>*</span>
        </label>
        <button
          type='button'
          onClick={useCurrentLocation}
          className='px-4 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-sm font-medium hover:bg-teal-100 transition-colors'
        >
          استخدام موقعي الحالي
        </button>
      </div>

      <div className='h-72 rounded-2xl overflow-hidden border border-stone-200 shadow-sm'>
        <MapContainer
          center={center}
          zoom={position ? 15 : 11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <RecenterMap lat={position?.lat} lng={position?.lng} />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            setLocationText={setLocationText}
          />
        </MapContainer>
      </div>

      {locationText && (
        <p className='text-sm text-slate-600 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3'>
          الموقع المحدد:{" "}
          <span className='font-medium text-slate-800'>{locationText}</span>
        </p>
      )}

      {geoError && (
        <p className='text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
          {geoError}
        </p>
      )}

      <p className='text-xs text-slate-400'>
        اضغطي على الخريطة لتحديد الموقع، أو استخدمي زر الموقع الحالي.
      </p>
    </div>
  );
};

export default LocationPicker;
