import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "../utils/leafletIcon";

const RecenterMap = ({ lat, lng, zoom = 13 }) => {
  const map = useMap();

  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);

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
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`,
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
  mapCenter = null, // { lat, lng } من اختيار المدينة
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
        const accuracy = Math.round(pos.coords.accuracy); // بالمتر

        setPosition({ lat, lng });
        reverseGeocode(lat, lng, setLocationText);

        // تنبيه إذا الدقة ضعيفة
        if (accuracy > 500) {
          setGeoError(
            `تم تحديد موقع تقريبي (نطاق الخطأ حوالي ${accuracy} متر). للأدق: فعّلي GPS أو حددي من الخريطة يدوياً.`,
          );
        }
      },
      (err) => {
        if (err.code === 1) {
          setGeoError(
            "تم رفض إذن الموقع. اسمحي للمتصفح بالوصول للموقع أو حددي من الخريطة.",
          );
        } else if (err.code === 2) {
          setGeoError(
            "تعذر تحديد موقعك حالياً. جرّبي مرة أخرى أو حددي من الخريطة.",
          );
        } else {
          setGeoError(
            "انتهت مهلة تحديد الموقع. تأكدي من تفعيل GPS ثم أعيدي المحاولة.",
          );
        }
      },
      {
        enableHighAccuracy: true, // مهم جداً
        timeout: 20000,
        maximumAge: 0, // لا يستخدم موقعاً قديماً محفوظاً
      },
    );
  };

  // أولوية المركز: موقع محدد → مدينة مختارة → الرياض
  const center =
    position?.lat != null && position?.lng != null
      ? [position.lat, position.lng]
      : mapCenter?.lat != null && mapCenter?.lng != null
        ? [mapCenter.lat, mapCenter.lng]
        : [24.7136, 46.6753];

  // إحداثيات لإعادة التوسيط (مدينة أو موقع)
  const recenterLat = position?.lat ?? mapCenter?.lat;
  const recenterLng = position?.lng ?? mapCenter?.lng;

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
          zoom={position || mapCenter ? 13 : 11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          <RecenterMap
            lat={recenterLat}
            lng={recenterLng}
            zoom={position ? 16 : mapCenter ? 14 : 11}
          />

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
        اختاري المدينة للانتقال السريع، ثم اضغطي على موقعك الدقيق داخل الخريطة.
        زر «موقعي الحالي» أدق على الجوال مع تفعيل GPS.
      </p>
    </div>
  );
};

export default LocationPicker;
