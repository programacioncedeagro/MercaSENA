'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DIVIPOLA_DATA, searchMunicipalities, type Municipality, type Department } from '@/lib/divipola';

interface LocationData {
  coordinates: [number, number]; // [lat, lng]
  address?: string;
  municipality?: Municipality;
  department?: Department;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  className?: string;
}

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  className = ''
}: LocationPickerProps) {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<LocationData>(
    initialLocation || { coordinates: [5.7833, -73.1167] } // Paipa por defecto
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{department: Department, municipality: Municipality}[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualCoords, setManualCoords] = useState('');

  // Buscar municipios
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const results = searchMunicipalities(term);
      setSearchResults(results.slice(0, 10));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Seleccionar municipio de la búsqueda
  const selectMunicipality = (department: Department, municipality: Municipality) => {
    if (municipality.coordinates) {
      const [lat, lng] = municipality.coordinates;
      const locationData: LocationData = {
        coordinates: [lat, lng],
        address: `${municipality.name}, ${department.name}`,
        municipality,
        department
      };
      
      setCurrentLocation(locationData);
      setShowResults(false);
      setSearchTerm(`${municipality.name}, ${department.name}`);
      onLocationSelect(locationData);
      
      toast({
        title: "Ubicación seleccionada",
        description: `${municipality.name}, ${department.name}`,
      });
    }
  };

  // Copiar coordenadas
  const copyCoordinates = () => {
    const coords = `${currentLocation.coordinates[0]}, ${currentLocation.coordinates[1]}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Coordenadas copiadas",
      description: "Las coordenadas se han copiado al portapapeles",
    });
  };

  // Ingresar coordenadas manualmente
  const handleManualCoords = () => {
    const coordsRegex = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
    const match = manualCoords.match(coordsRegex);
    
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const locationData: LocationData = {
          coordinates: [lat, lng],
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
        
        setCurrentLocation(locationData);
        onLocationSelect(locationData);
        setManualCoords('');
        
        toast({
          title: "Coordenadas establecidas",
          description: `Latitud: ${lat}, Longitud: ${lng}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Coordenadas inválidas",
          description: "Las coordenadas deben estar en rangos válidos",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Formato incorrecto",
        description: "Usa el formato: latitud, longitud (ej: 5.7833, -73.1167)",
      });
    }
  };

  // Abrir en Google Maps
  const openInGoogleMaps = () => {
    const [lat, lng] = currentLocation.coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Seleccionar Ubicación
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Búsqueda de municipios */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar municipio... (ej: Paipa, Sogamoso, Tunja)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.department.id}-${result.municipality.id}`}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => selectMunicipality(result.department, result.municipality)}
                >
                  <div>
                    <div className="font-medium">{result.municipality.name}</div>
                    <div className="text-sm text-muted-foreground">{result.department.name}</div>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coordenadas manuales */}
        <div className="flex gap-2">
          <Input
            placeholder="Coordenadas manuales (lat, lng)"
            value={manualCoords}
            onChange={(e) => setManualCoords(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleManualCoords} variant="outline">
            Establecer
          </Button>
        </div>

        {/* Información de ubicación actual */}
        {currentLocation.address && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentLocation.address}
              </Badge>
              {currentLocation.municipality && (
                <Badge variant="outline">
                  DIVIPOLA: {currentLocation.municipality.id}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Coordenadas y acciones */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <div className="font-medium">Coordenadas:</div>
            <div className="text-muted-foreground">
              Lat: {currentLocation.coordinates[0].toFixed(6)}, 
              Lng: {currentLocation.coordinates[1].toFixed(6)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCoordinates}
              title="Copiar coordenadas"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInGoogleMaps}
              title="Ver en Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mapa interactivo placeholder */}
        <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border-2 border-dashed border-green-200 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <p className="text-green-700 font-medium mb-2">Mapa Interactivo</p>
            <p className="text-sm text-green-600 mb-4">
              Token de Mapbox disponible - Mapa en desarrollo
            </p>
            <Button onClick={openInGoogleMaps} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver en Google Maps
            </Button>
          </div>
        </div>

        {/* Municipios populares de Boyacá */}
        <div>
          <h4 className="text-sm font-medium mb-2">Municipios populares de Boyacá:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Paipa", coords: [5.7833, -73.1167] },
              { name: "Sogamoso", coords: [5.7167, -72.9333] },
              { name: "Duitama", coords: [5.8278, -73.0403] },
              { name: "Tunja", coords: [5.5353, -73.3678] },
              { name: "Villa de Leyva", coords: [5.6333, -73.5333] },
              { name: "Chiquinquirá", coords: [5.6167, -73.8167] }
            ].map((city) => (
              <Button
                key={city.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  const boyaca = DIVIPOLA_DATA.find(d => d.id === "15");
                  const municipality = boyaca?.municipalities.find(m => m.name === city.name);
                  if (municipality && boyaca) {
                    selectMunicipality(boyaca, municipality);
                  }
                }}
                className="text-xs"
              >
                {city.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}