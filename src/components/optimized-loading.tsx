'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface OptimizedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'skeleton';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

// Componente de loading optimizado para dispositivos de gama baja
export function OptimizedLoading({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text,
  fullScreen = false
}: OptimizedLoadingProps) {
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const LoadingSpinner = () => (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-green-600',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );

  const LoadingPulse = () => (
    <div 
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );

  const LoadingSkeleton = () => (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  const renderLoading = () => {
    switch (variant) {
      case 'pulse':
        return <LoadingPulse />;
      case 'skeleton':
        return <LoadingSkeleton />;
      default:
        return <LoadingSpinner />;
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          {renderLoading()}
          {text && (
            <p className="text-sm text-gray-600 animate-pulse">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {renderLoading()}
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
}

// Componente de skeleton para cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border rounded-lg p-4 space-y-3 animate-pulse", className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded"></div>
        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}

// Componente para mostrar estado de conexión
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [showStatus, setShowStatus] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
      isOnline 
        ? "bg-green-500 text-white" 
        : "bg-red-500 text-white"
    )}>
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-white" : "bg-white animate-pulse"
        )}></div>
        {isOnline ? "Conectado" : "Sin conexión"}
      </div>
    </div>
  );
}

// Hook para detectar conexión lenta
export function useSlowConnection() {
  const [isSlowConnection, setIsSlowConnection] = React.useState(false);

  React.useEffect(() => {
    // Detectar conexión lenta usando Navigation Timing API
    if (typeof window !== 'undefined' && 'navigator' in window) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        const updateConnectionStatus = () => {
          // Considerar conexión lenta si es 2G o 3G lenta
          const slowTypes = ['slow-2g', '2g', '3g'];
          setIsSlowConnection(
            slowTypes.includes(connection.effectiveType) || 
            connection.downlink < 1.5
          );
        };

        updateConnectionStatus();
        connection.addEventListener('change', updateConnectionStatus);

        return () => {
          connection.removeEventListener('change', updateConnectionStatus);
        };
      }
    }
  }, []);

  return isSlowConnection;
}