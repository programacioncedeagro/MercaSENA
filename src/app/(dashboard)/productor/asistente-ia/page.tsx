'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRecommendationAction } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AIAssistantPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cropType, setCropType] = useState('Tomate');
  const [location, setLocation] = useState('Villa de Leyva, Boyacá');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const farmerImage = PlaceHolderImages.find(p => p.id === 'farmer-profile-1')?.imageUrl;

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

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

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const result = await getRecommendationAction({
      question: input,
      cropType,
      location,
    });
    
    setIsLoading(false);

    if (result.success && result.data) {
      setMessages([...newMessages, { role: 'assistant', content: result.data.answer }]);
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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto h-[calc(100vh-10rem)]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Asistente IA Agrónomo</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Tu experto personal. Haz preguntas sobre tus cultivos y obtén recomendaciones.
        </p>
      </div>

      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="grid gap-2 md:grid-cols-2 w-full">
            <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger><SelectValue placeholder="Selecciona cultivo" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Tomate">Tomate</SelectItem>
                    <SelectItem value="Lechuga">Lechuga</SelectItem>
                    <SelectItem value="Papa">Papa</SelectItem>
                </SelectContent>
            </Select>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ubicación" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ScrollArea className="h-full max-h-[50vh] pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                  <Bot className="mx-auto h-12 w-12 mb-4" />
                  <p>¿En qué puedo ayudarte hoy con tu cultivo de {cropType}?</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-2xl p-4 max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                    <p className="text-base">{message.content}</p>
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
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarFallback><Bot/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl p-4 max-w-lg bg-muted rounded-bl-none flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Pensando...</span>
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
              placeholder="Escribe tu pregunta aquí... (ej: ¿cuándo debo fertilizar?)"
              className="h-14 text-lg"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="h-14 w-14" disabled={isLoading}>
              <Send className="h-6 w-6" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
