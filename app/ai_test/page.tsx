'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const BUSINESS_ID = 1; // Salterius

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AITestPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservationCreated, setReservationCreated] = useState<any>(null);
  const [conversationActive, setConversationActive] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // Auto-scroll al final de la conversación
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startConversation = async () => {
    try {
      setError(null);
      setConversation([]);
      setReservationCreated(null);
      setConversationActive(true);
      setCurrentTranscript('');
      setConversationId(null);
      // NO iniciar grabación automáticamente, solo activar la conversación
    } catch (err: any) {
      setError(`Error al iniciar conversación: ${err.message}`);
      console.error('Error starting conversation:', err);
    }
  };

  const endConversation = async () => {
    // Si hay una conversación activa, marcarla como terminada
    if (conversationId) {
      try {
        await fetch('/api/conversations', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            status: 'cancelled',
          }),
        });
      } catch (err) {
        console.error('Error ending conversation:', err);
        // Continuar aunque falle
      }
    }
    
    setConversationActive(false);
    stopRecording();
    setIsProcessing(false);
    setConversationId(null); // Resetear para que la próxima sea nueva
  };

  const startRecording = async () => {
    try {
      // Si ya está grabando, no hacer nada
      if (isRecording) {
        return;
      }

      // Limpiar cualquier stream anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Limpiar el stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          setIsProcessing(true);
          setIsRecording(false);
          await transcribeAudio(audioBlob);
        } else {
          setIsProcessing(false);
          setIsRecording(false);
        }
        
        mediaRecorderRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(`Error al acceder al micrófono: ${err.message}`);
      console.error('Error accessing microphone:', err);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    try {
      // Detener el MediaRecorder
      if (mediaRecorderRef.current) {
        const state = mediaRecorderRef.current.state;
        if (state === 'recording' || state === 'paused') {
          mediaRecorderRef.current.stop();
        }
      }
      
      // Detener y limpiar el stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('businessId', BUSINESS_ID.toString());

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la transcripción');
      }

      const data = await response.json();
      const userMessage = data.text;
      setCurrentTranscript(userMessage);

      // Agregar mensaje del usuario a la conversación
      setConversation((prev) => [
        ...prev,
        { role: 'user', content: userMessage, timestamp: new Date() },
      ]);

      // Generar respuesta AI con historial
      if (userMessage) {
        await generateAIResponse(userMessage, BUSINESS_ID);
      } else {
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(`Error en transcripción: ${err.message}`);
      console.error('Error transcribing:', err);
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (text: string, businessId: number) => {
    try {
      setError(null);
      
      const body: any = {
        text,
        businessId,
      };
      
      if (conversationId !== null) {
        body.conversationId = conversationId;
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la generación AI');
      }

      const data = await response.json();
      
      // Agregar respuesta del asistente a la conversación
      if (data.assistantMessage) {
        setConversation((prev) => [
          ...prev,
          { role: 'assistant', content: data.assistantMessage, timestamp: new Date() },
        ]);
      }

      // Guardar conversationId si viene en la respuesta
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setIsProcessing(false);

      // SOLO crear reserva si tenemos todos los datos y la acción es create_reservation
      if (data.action?.type === 'create_reservation') {
        // Los datos vienen en action.data, no en reservationData
        const reservationData = data.action.data;
        
        // Validar que tenemos TODOS los datos necesarios
        const hasAllData = 
          reservationData.customerName &&
          reservationData.customerName.trim() !== '' &&
          reservationData.customerName.toLowerCase() !== 'cliente' &&
          reservationData.partySize &&
          reservationData.date &&
          reservationData.time;

        if (hasAllData) {
          console.log('Creando reserva con datos:', reservationData);
          await createReservation(reservationData, businessId);
        } else {
          console.log('Faltan datos para crear reserva:', reservationData);
        }
      } else if (data.action?.type === 'end_conversation') {
        endConversation();
      }
      // NO reiniciar automáticamente - el usuario decide cuándo hablar de nuevo
    } catch (err: any) {
      setError(`Error en generación AI: ${err.message}`);
      console.error('Error generating AI response:', err);
      setIsProcessing(false);
    }
  };

  const createReservation = async (reservationData: any, businessId: number) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      const body: any = {
        businessId,
        ...reservationData,
        status: 'pending',
        source: 'phone',
      };
      
      if (conversationId !== null) {
        body.conversationId = conversationId;
      }
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear reserva');
      }

      const data = await response.json();
      setReservationCreated(data);
      
      // Agregar confirmación a la conversación
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `¡Perfecto! Tu reserva ha sido confirmada. ID: ${data.id}. Te esperamos el ${data.date} a las ${data.time} para ${data.partySize} personas.`,
          timestamp: new Date(),
        },
      ]);
      
      setIsProcessing(false);
      
      // Marcar conversación como completada (ya se hace en el backend, pero resetear el ID)
      setConversationId(null); // Resetear para que la próxima conversación sea nueva
    } catch (err: any) {
      setError(`Error al crear reserva: ${err.message}`);
      console.error('Error creating reservation:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Prueba de AI Voice Agent</h1>
      <p className="text-gray-600 mb-6">
        Business ID: <strong>{BUSINESS_ID}</strong> (Salterius)
      </p>

      <div className="space-y-6">
        {/* Controles de conversación */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Conversación</h2>
          <div className="flex gap-4 items-center flex-wrap">
            {!conversationActive ? (
              <Button onClick={startConversation} size="lg" disabled={isProcessing}>
                🎤 Iniciar Conversación
              </Button>
            ) : (
              <>
                {!isRecording ? (
                  <Button onClick={startRecording} size="lg" disabled={isProcessing}>
                    🎤 Iniciar Grabación
                  </Button>
                ) : (
                  <Button onClick={stopRecording} size="lg" variant="outline">
                    ⏸️ Parar Grabación
                  </Button>
                )}
                <Button onClick={endConversation} size="lg" variant="destructive" disabled={isProcessing}>
                  🛑 Terminar Conversación
                </Button>
              </>
            )}
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Escuchando...</span>
              </div>
            )}
            {isProcessing && !isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Procesando...</span>
              </div>
            )}
          </div>
        </Card>

        {/* Historial de conversación */}
        {conversation.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historial de Conversación</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          </Card>
        )}

        {/* Transcripción actual */}
        {currentTranscript && conversation.length === 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Transcripción</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {currentTranscript}
            </p>
          </Card>
        )}

        {/* Reserva creada */}
        {reservationCreated && (
          <Card className="p-6 border-green-200 bg-green-50">
            <h2 className="text-xl font-semibold mb-2 text-green-800">
              ✅ Reserva Creada Exitosamente
            </h2>
            <div className="space-y-1 text-sm">
              <p><strong>ID de Reserva:</strong> {reservationCreated.id}</p>
              <p><strong>Cliente:</strong> {reservationCreated.customerName}</p>
              <p><strong>Personas:</strong> {reservationCreated.partySize}</p>
              <p><strong>Fecha:</strong> {reservationCreated.date}</p>
              <p><strong>Hora:</strong> {reservationCreated.time}</p>
              <p><strong>Estado:</strong> {reservationCreated.status}</p>
            </div>
          </Card>
        )}

        {/* Errores */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <h2 className="text-xl font-semibold mb-2 text-red-800">Error</h2>
            <p className="text-red-600">{error}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
