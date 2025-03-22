import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceControlProps {
  isListening: boolean;
  onToggle: () => void;
  transcript: string;
}

export function VoiceControl({ isListening, onToggle, transcript }: VoiceControlProps) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
          if (permission.state === 'denied') {
            setError('El acceso al micrófono ha sido denegado. Por favor, habilita el acceso en la configuración de tu navegador.');
          }
        });
      } catch (err) {
        console.error('Error checking microphone permission:', err);
        setError('No se pudo verificar el permiso del micrófono.');
      }
    };

    checkMicrophonePermission();
  }, []);

  const handleToggle = async () => {
    if (permissionStatus === 'denied') {
      setError('Por favor, habilita el acceso al micrófono en la configuración de tu navegador.');
      return;
    }

    try {
      await onToggle();
    } catch (err) {
      setError('Error al acceder al micrófono. Por favor, asegúrate de que tu dispositivo tiene un micrófono y que has concedido los permisos necesarios.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          className={`p-4 rounded-full transition-all transform ${
            isListening 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
          }`}
          title={isListening ? "Detener grabación" : "Iniciar grabación"}
          disabled={permissionStatus === 'denied'}
        >
          {isListening ? (
            <Mic className="w-6 h-6 animate-bounce" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </button>
        <div className="flex-1">
          <div className={`p-4 bg-white rounded-lg border ${transcript ? 'border-indigo-200' : 'border-gray-200'} transition-colors`}>
            <input
              type="text"
              value={transcript}
              readOnly
              placeholder="Haz clic en el micrófono y pregunta sobre productos..."
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          {isListening && (
            <p className="text-sm text-indigo-600 mt-2 ml-2 animate-pulse">
              Escuchando... Habla ahora
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 p-3 bg-red-50 rounded-lg">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {permissionStatus === 'prompt' && (
        <div className="flex items-center gap-2 text-indigo-600 p-3 bg-indigo-50 rounded-lg">
          <AlertCircle size={20} />
          <p className="text-sm">Por favor, permite el acceso al micrófono cuando el navegador lo solicite.</p>
        </div>
      )}
    </div>
  );
}