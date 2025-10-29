'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, User, Send, Loader2, History, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRecommendationAction } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AIResponse } from '@/components/ai-response';
import { useUser, initializeFirebase } from '@/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  cropType: string;
  location: string;
};

type SavedConsultation = {
  id: string;
  question: string;
  answer: string;
  cropType: string;
  location: string;
  timestamp: Date;
  userId: string;
};

export default function AIAssistantPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedConsultations, setSavedConsultations] = useState<SavedConsultation[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cropType, setCropType] = useState('Papa');
  const [location, setLocation] = useState('Paipa, Boyacá');
  const [activeTab, setActiveTab] = useState('chat');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { firestore } = initializeFirebase();
  
  const farmerImage = PlaceHolderImages.find(p => p.id === 'farmer-profile-1')?.imageUrl;

  // Cargar consultas guardadas del usuario
  useEffect(() => {
    if (user && firestore) {
      const consultationsQuery = query(
        collection(firestore, 'consultations'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const unsubscribe = onSnapshot(consultationsQuery, (snapshot) => {
        const consultations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as SavedConsultation[];
        setSavedConsultations(consultations);
      });

      return () => unsubscribe();
    }
  }, [user, firestore]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  const saveConsultation = async (question: string, answer: string) => {
    if (user && firestore) {
      try {
        await addDoc(collection(firestore, 'consultations'), {
          userId: user.uid,
          question,
          answer,
          cropType,
          location,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error saving consultation:', error);
      }
    }
  };

  const deleteConsultation = async (consultationId: string) => {
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'consultations', consultationId));
        toast({
          title: "Consulta eliminada",
          description: "La consulta se ha eliminado de tu historial.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la consulta.",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !cropType || !location) {
        toast({
            variant: "destructive",
            title: "Faltan datos",
            description: "Por favor, escribe una pregunta y asegúrate de haber seleccionado un cultivo y una ubicación.",
        });
        return;
    }

    const timestamp = new Date();
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp,
      cropType,
      location
    };

    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    const question = input;
    setInput('');
    setIsLoading(true);

    const result = await getRecommendationAction({
      question: question,
      cropType,
      location,
    });
    
    setIsLoading(false);

    if (result.success && result.data) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.data.answer,
        timestamp: new Date(),
        cropType,
        location
      };
      
      setMessages([...newMessages, assistantMessage]);
      
      // Guardar la consulta en Firestore
      await saveConsultation(question, result.data.answer);
    } else {
      toast({
        variant: "destructive",
        title: "Error del Asistente",
        description: result.error || "No se pudo obtener una respuesta. Inténtalo de nuevo.",
      });
      // Optionally remove the user's message if the call fails
      setMessages(messages);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto h-[calc(100vh-10rem)]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">🌾 Asistente IA Agrónomo</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Tu experto personal. Haz preguntas sobre tus cultivos y obtén recomendaciones estructuradas.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Consultar Asistente
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial ({savedConsultations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-grow flex flex-col mt-6">
          <Card className="flex-grow flex flex-col shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="grid gap-2 md:grid-cols-2 w-full">
                <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger><SelectValue placeholder="Selecciona cultivo" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Papa">🥔 Papa</SelectItem>
                        <SelectItem value="Tomate">🍅 Tomate</SelectItem>
                        <SelectItem value="Lechuga">🥬 Lechuga</SelectItem>
                        <SelectItem value="Maíz">🌽 Maíz</SelectItem>
                        <SelectItem value="Frijol">🫘 Frijol</SelectItem>
                        <SelectItem value="Cebolla">🧅 Cebolla</SelectItem>
                        <SelectItem value="Zanahoria">🥕 Zanahoria</SelectItem>
                        <SelectItem value="Habichuela">🫛 Habichuela</SelectItem>
                        <SelectItem value="Papayuela">🍈 Papayuela</SelectItem>
                    </SelectContent>
                </Select>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="📍 Ubicación (ej: Paipa, Boyacá)" />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ScrollArea className="h-full max-h-[50vh] pr-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                      <Bot className="mx-auto h-12 w-12 mb-4 text-green-600" />
                      <p className="text-lg">¿En qué puedo ayudarte hoy con tu cultivo de {cropType}?</p>
                      <p className="text-sm mt-2">Pregunta sobre siembra, fertilización, plagas, costos, cronogramas y más.</p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'assistant' && (
                        <Avatar className="h-10 w-10 border-2 border-green-600">
                          <AvatarFallback className="bg-green-100"><Bot className="h-5 w-5 text-green-600"/></AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-4xl w-full ${message.role === 'user' ? 'max-w-lg' : ''}`}>
                        {message.role === 'assistant' ? (
                          <AIResponse 
                            content={message.content}
                            timestamp={message.timestamp}
                            cropType={message.cropType}
                            location={message.location}
                          />
                        ) : (
                          <div className="rounded-2xl p-4 bg-green-600 text-white rounded-br-none ml-auto max-w-lg">
                            <p className="text-base">{message.content}</p>
                            <p className="text-xs opacity-80 mt-2">
                              {message.timestamp.toLocaleTimeString('es-CO')}
                            </p>
                          </div>
                        )}
                      </div>
                       {message.role === 'user' && (
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={farmerImage} alt="Productor" />
                          <AvatarFallback><User/></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                     <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-green-600">
                          <AvatarFallback className="bg-green-100"><Bot className="h-5 w-5 text-green-600"/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-2xl p-4 max-w-lg bg-muted rounded-bl-none flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                            <span>Analizando tu consulta...</span>
                        </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="flex w-full items-center space-x-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="💬 Escribe tu pregunta aquí... (ej: ¿cuándo debo fertilizar mi papa?)"
                  className="h-14 text-lg"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-14 w-14 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  <Send className="h-6 w-6" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="flex-grow mt-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial de Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                {savedConsultations.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">
                    <History className="mx-auto h-12 w-12 mb-4" />
                    <p>No tienes consultas guardadas aún.</p>
                    <p className="text-sm mt-2">Tus consultas se guardarán automáticamente.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedConsultations.map((consultation) => (
                      <Card key={consultation.id} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">🌱 {consultation.cropType}</Badge>
                              <Badge variant="outline">📍 {consultation.location}</Badge>
                              <Badge variant="outline">📅 {consultation.timestamp.toLocaleDateString('es-CO')}</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteConsultation(consultation.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-green-800 mb-1">Pregunta:</h4>
                              <p className="text-sm text-gray-700">{consultation.question}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-green-800 mb-1">Respuesta:</h4>
                              <AIResponse 
                                content={consultation.answer}
                                timestamp={consultation.timestamp}
                                cropType={consultation.cropType}
                                location={consultation.location}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
