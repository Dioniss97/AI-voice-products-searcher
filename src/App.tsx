import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { VoiceControl } from './components/VoiceControl';
import { ProductGrid } from './components/ProductGrid';
import { ErrorMessage } from './components/ErrorMessage';
import { fetchProducts } from './services/api';
import { processVoiceCommand } from './services/openai';
import { Product, ProductFilters } from './types';

// Inicialización del reconocimiento de voz con manejo de compatibilidad
const createSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('Tu navegador no soporta el reconocimiento de voz. Por favor, utiliza un navegador más moderno.');
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'es-ES';
  return recognition;
};

const ITEMS_PER_PAGE = 9;

function App() {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortField, setSortField] = useState<string>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const transcriptRef = useRef('');
  const isProcessingRef = useRef(false);
  const currentFiltersRef = useRef<ProductFilters>({});
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const loadProducts = async (newFilters: ProductFilters = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const filters = {
        ...newFilters,
        limit: ITEMS_PER_PAGE,
        skip: (currentPage - 1) * ITEMS_PER_PAGE
      };
      currentFiltersRef.current = filters;
      const { products: newProducts, total } = await fetchProducts(filters);
      setProducts(newProducts);
      setTotalProducts(total);
      return newProducts;
    } catch (error) {
      setError('Error al cargar los productos');
      console.error(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCommand = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsLoading(true);
    setError('');
    try {
      console.log('Procesando comando de voz:', transcript);
      const result = await processVoiceCommand(transcript);
      console.log('Resultado del comando de voz:', result);
      
      setCurrentPage(1);
      await loadProducts(result.filters);
    } catch (error) {
      console.error('Error en handleVoiceCommand:', error);
      setError('Error al procesar el comando de voz');
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    
    const newFilters = {
      ...currentFiltersRef.current,
      sortBy: field,
      order: newOrder
    };
    loadProducts(newFilters);
  };

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) {
      try {
        recognitionRef.current = createSpeechRecognition();
        setupRecognitionHandlers();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al inicializar el reconocimiento de voz');
        return;
      }
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        await recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error al cambiar el estado de escucha:', error);
      setError('Error al acceder al micrófono. Por favor, verifica los permisos.');
    }
  }, [isListening]);

  const setupRecognitionHandlers = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onstart = () => {
      console.log('Iniciado reconocimiento de voz');
      setIsListening(true);
      setTranscript('');
      setFinalTranscript('');
      transcriptRef.current = '';
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcriptResult = event.results[0][0].transcript;
      console.log('Resultado del reconocimiento de voz:', transcriptResult);
      transcriptRef.current = transcriptResult;
      setTranscript(transcriptResult);
    };

    recognitionRef.current.onend = () => {
      console.log('Finalizado reconocimiento de voz');
      const transcript = transcriptRef.current.trim();
      setFinalTranscript(transcript);
      setIsListening(false);

      if (transcript) {
        handleVoiceCommand(transcript);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Error en reconocimiento de voz:', event.error);
      let errorMessage = 'Error en el reconocimiento de voz';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No se detectó ningún sonido. Por favor, intenta de nuevo.';
          break;
        case 'aborted':
          errorMessage = 'El reconocimiento de voz fue interrumpido.';
          break;
        case 'audio-capture':
          errorMessage = 'No se pudo capturar el audio. Verifica tu micrófono.';
          break;
        case 'network':
          errorMessage = 'Error de red. Verifica tu conexión.';
          break;
        case 'not-allowed':
          errorMessage = 'El acceso al micrófono fue denegado.';
          break;
        case 'service-not-available':
          errorMessage = 'El servicio de reconocimiento de voz no está disponible.';
          break;
        case 'bad-grammar':
          errorMessage = 'Error en la gramática del reconocimiento de voz.';
          break;
        case 'language-not-supported':
          errorMessage = 'El idioma no está soportado.';
          break;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };
  };

  useEffect(() => {
    loadProducts();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    loadProducts(currentFiltersRef.current);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Búsqueda de Productos por Voz</h1>
            </div>

            <VoiceControl
              isListening={isListening}
              onToggle={toggleListening}
              transcript={interimTranscript}
            />
          </div>

          {error && <ErrorMessage message={error} />}

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <ProductGrid 
              products={products}
              currentPage={currentPage}
              totalProducts={totalProducts}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;