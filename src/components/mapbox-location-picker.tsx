"use client";

import React, { useCallback, useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox';

// Mapbox token - Next.js inlines `process.env.NEXT_PUBLIC_*` at build time for the client
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Crosshair, Copy, Check, Globe, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DIVIPOLA_DATA, searchMunicipalities, type Municipality, type Department } from '@/lib/divipola';

interface LocationData {
  coordinates: [number, number]; // [lat, lng]
  address?: string;
  municipality?: Municipality;
  department?: Department;
}

interface MapboxLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  className?: string;
  height?: string;
  showSearch?: boolean;
  showCoordinates?: boolean;
}

// Ubicación por defecto: Centro aproximado del departamento de Boyacá
const DEFAULT_LOCATION: [number, number] = [5.6356, -73.5242];

export function MapboxLocationPicker({
  onLocationSelect,
  initialLocation,
  className = '',
  height = '400px',
  showSearch = true,
  showCoordinates = true
}: MapboxLocationPickerProps) {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<LocationData>(
    initialLocation || { coordinates: DEFAULT_LOCATION }
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{department: Department, municipality: Municipality}[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualLat, setManualLat] = useState(currentLocation.coordinates[0].toString());
  const [manualLng, setManualLng] = useState(currentLocation.coordinates[1].toString());

  // Función para obtener información de ubicación basada en coordenadas
  const getLocationInfo = useCallback(async (lat: number, lng: number): Promise<LocationData> => {
    try {
      // Buscar en DIVIPOLA por proximidad (esto es una aproximación simple)
      let municipality: Municipality | undefined;
      let department: Department | undefined;
      
      // Para una implementación más precisa, aquí se podría usar un servicio de geocodificación
      // Por ahora, asumimos que el usuario seleccionará el municipio correcto
      
      return {
        coordinates: [lat, lng],
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        municipality,
        department
      };
    } catch (error) {
      console.error('Error obteniendo información de ubicación:', error);
      return {
        coordinates: [lat, lng],
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
    }
  }, []);

  // Función para buscar municipios
  const handleSearch = useCallback((term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = searchMunicipalities(term);
    setSearchResults(results.slice(0, 10)); // Limitar a 10 resultados
    setShowResults(true);
  }, []);

  // Función para seleccionar un municipio de los resultados
  const handleMunicipalitySelect = useCallback(async (result: {department: Department, municipality: Municipality}) => {
    const coords = result.municipality.coordinates;
    if (!coords) {
      toast({
        title: "Error",
        description: "No se encontraron coordenadas para este municipio",
        variant: "destructive"
      });
      return;
    }
    
    const locationData = await getLocationInfo(coords[0], coords[1]);
    locationData.municipality = result.municipality;
    locationData.department = result.department;
    locationData.address = `${result.municipality.name}, ${result.department.name}`;
    
    setCurrentLocation(locationData);
    setManualLat(coords[0].toString());
    setManualLng(coords[1].toString());
    setSearchTerm(`${result.municipality.name}, ${result.department.name}`);
    setShowResults(false);
    onLocationSelect(locationData);
    
    toast({
      title: "Ubicación seleccionada",
      description: `${result.municipality.name}, ${result.department.name}`,
    });
  }, [getLocationInfo, onLocationSelect, toast]);

  // Función para usar coordenadas manuales
  const handleManualCoordinates = useCallback(async () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Error",
        description: "Por favor ingresa coordenadas válidas",
        variant: "destructive"
      });
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        title: "Error", 
        description: "Las coordenadas están fuera del rango válido",
        variant: "destructive"
      });
      return;
    }
    
    const locationData = await getLocationInfo(lat, lng);
    setCurrentLocation(locationData);
    onLocationSelect(locationData);
    
    toast({
      title: "Ubicación actualizada",
      description: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  }, [manualLat, manualLng, getLocationInfo, onLocationSelect, toast]);

  // Función para obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "La geolocalización no está disponible en este dispositivo",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locationData = await getLocationInfo(lat, lng);
        
        setCurrentLocation(locationData);
        setManualLat(lat.toString());
        setManualLng(lng.toString());
        onLocationSelect(locationData);
        
        toast({
          title: "Ubicación obtenida",
          description: "Se ha obtenido tu ubicación actual",
        });
      },
      (error) => {
        toast({
          title: "Error de geolocalización",
          description: "No se pudo obtener tu ubicación actual",
          variant: "destructive"
        });
      }
    );
  }, [getLocationInfo, onLocationSelect, toast]);

  // Función para copiar coordenadas
  const copyCoordinates = useCallback(() => {
    const coords = `${currentLocation.coordinates[0]}, ${currentLocation.coordinates[1]}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Coordenadas copiadas",
      description: coords,
    });
  }, [currentLocation, toast]);

  // Función para abrir en Google Maps
  const openInGoogleMaps = useCallback(() => {
    const [lat, lng] = currentLocation.coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }, [currentLocation]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, handleSearch]);

  // Ciudades populares de Boyacá para acceso rápido
  const popularCities = [
    { name: 'Tunja', coords: [5.5353, -73.3678] as [number, number] },
    { name: 'Duitama', coords: [5.8242, -73.0347] as [number, number] },
    { name: 'Sogamoso', coords: [5.7247, -72.9342] as [number, number] },
    { name: 'Chiquinquirá', coords: [5.6186, -73.8197] as [number, number] },
    { name: 'Villa de Leyva', coords: [5.6356, -73.5242] as [number, number] }
  ];

  const handlePopularCitySelect = useCallback(async (city: { name: string, coords: [number, number] }) => {
    const locationData = await getLocationInfo(city.coords[0], city.coords[1]);
    
    // Buscar el municipio en DIVIPOLA
    const searchResults = searchMunicipalities(city.name);
    if (searchResults.length > 0) {
      locationData.municipality = searchResults[0].municipality;
      locationData.department = searchResults[0].department;
      locationData.address = `${city.name}, ${searchResults[0].department.name}`;
    } else {
      locationData.address = `${city.name}, Boyacá`;
    }
    
    setCurrentLocation(locationData);
    setManualLat(city.coords[0].toString());
    setManualLng(city.coords[1].toString());
    setSearchTerm(city.name);
    onLocationSelect(locationData);
    
    toast({
      title: "Ubicación seleccionada",
      description: city.name,
    });
  }, [getLocationInfo, onLocationSelect, toast]);

  const heightClass = height === '260px' ? 'h-[260px]' : height === '400px' ? 'h-[400px]' : 'h-96';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Seleccionar Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda de municipios */}
        {showSearch && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar municipio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Resultados de búsqueda */}
            {showResults && searchResults.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleMunicipalitySelect(result)}
                    className="w-full text-left p-2 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span>{result.municipality.name}</span>
                    <Badge variant="secondary">{result.department.name}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ciudades populares de acceso rápido */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Ciudades Populares de Boyacá:</h4>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <Badge
                key={city.name}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handlePopularCitySelect(city)}
              >
                {city.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Coordenadas manuales */}
        {showCoordinates && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Coordenadas Manuales:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Latitud"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                type="number"
                step="any"
              />
              <Input
                placeholder="Longitud"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                type="number"
                step="any"
              />
            </div>
            <Button onClick={handleManualCoordinates} className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Usar Coordenadas
            </Button>
          </div>
        )}

        {/* Controles de ubicación */}
        <div className="flex gap-2">
          <Button onClick={getCurrentLocation} variant="outline" className="flex-1">
            <Crosshair className="w-4 h-4 mr-2" />
            Mi Ubicación
          </Button>
          <Button onClick={openInGoogleMaps} variant="outline" className="flex-1">
            <Globe className="w-4 h-4 mr-2" />
            Ver en Maps
          </Button>
        </div>

        {/* Información de ubicación actual */}
        <div className="p-3 bg-gray-50 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ubicación Actual:</span>
            <Button
              onClick={copyCoordinates}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          
          {currentLocation.address && (
            <p className="text-sm text-gray-600">{currentLocation.address}</p>
          )}
          
          <p className="text-xs text-gray-500 font-mono">
            {currentLocation.coordinates[0].toFixed(6)}, {currentLocation.coordinates[1].toFixed(6)}
          </p>
          
          {currentLocation.municipality && (
            <div className="flex gap-2">
              <Badge variant="secondary">{currentLocation.municipality.name}</Badge>
              {currentLocation.department && (
                <Badge variant="outline">{currentLocation.department.name}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Mapa interactivo */}
        <div className={`relative rounded-md overflow-hidden ${heightClass}`}>
          <Map
            initialViewState={{
              longitude: currentLocation.coordinates[1],
              latitude: currentLocation.coordinates[0],
              zoom: 9
            }}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            onClick={async (evt) => {
              try {
                const anyEvt: any = evt;
                let lng: number | undefined;
                let lat: number | undefined;
                if (Array.isArray(anyEvt.lngLat)) {
                  [lng, lat] = anyEvt.lngLat;
                } else if (anyEvt.lngLat && typeof anyEvt.lngLat.toArray === 'function') {
                  const arr = anyEvt.lngLat.toArray();
                  if (Array.isArray(arr)) [lng, lat] = arr as [number, number];
                } else if (anyEvt.lngLat && typeof anyEvt.lngLat.lng === 'number') {
                  lng = anyEvt.lngLat.lng;
                  lat = anyEvt.lngLat.lat;
                }
                if (typeof lat !== 'number' || typeof lng !== 'number') return;
                const loc = await getLocationInfo(lat, lng);
                setCurrentLocation(loc);
                setManualLat(lat.toString());
                setManualLng(lng.toString());
                onLocationSelect(loc);
              } catch (err) {
                console.error('Error handling map click:', err);
              }
            }}
          >
            <NavigationControl position="top-left" />
            <Marker longitude={currentLocation.coordinates[1]} latitude={currentLocation.coordinates[0]} anchor="bottom">
              <MapPin className="w-6 h-6 text-red-600" />
            </Marker>
          </Map>
        </div>
      </CardContent>
    </Card>
  );
}