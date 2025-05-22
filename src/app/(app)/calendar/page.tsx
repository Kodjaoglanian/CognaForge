
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { format, parseISO, startOfDay, isEqual, addHours, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageTitle } from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Calendar as ShadCalendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { planDayWithAI, type DailyPlannerInput, type DailyPlannerOutput } from '@/ai/flows/daily-planner-flow';
import { Loader2, AlertCircle, PlusCircle, CalendarPlus, Sparkles, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarEvent {
  id: string;
  date: string; // ISO string for date part only, e.g., "2024-05-25"
  time: string; // HH:mm format, e.g., "09:00"
  title: string;
  description?: string;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDayEvents, setCurrentDayEvents] = useState<CalendarEvent[]>([]);

  // State for adding/editing events
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [eventDescription, setEventDescription] = useState('');

  const [mainGoal, setMainGoal] = useState('');
  const [aiPlan, setAiPlan] = useState<DailyPlannerOutput | null>(null);
  
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false); // For future async event loading
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('ai-calendar-events');
      if (savedEvents) {
        const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      }
    } catch (e) {
      console.error("Failed to load events from localStorage", e);
      toast({ title: "Erro ao Carregar Eventos", description: "Não foi possível carregar eventos salvos.", variant: "destructive"});
    }
  }, [toast]);

  // Update currentDayEvents when selectedDate or events change
  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setCurrentDayEvents(
        events
          .filter(event => event.date === dateStr)
          .sort((a, b) => a.time.localeCompare(b.time)) // Sort events by time
      );
    } else {
      setCurrentDayEvents([]);
    }
  }, [selectedDate, events]);

  const saveEventsToLocalStorage = (updatedEvents: CalendarEvent[]) => {
    try {
      localStorage.setItem('ai-calendar-events', JSON.stringify(updatedEvents));
    } catch (e) {
      console.error("Failed to save events to localStorage", e);
      toast({ title: "Erro ao Salvar Eventos", description: "Não foi possível salvar os eventos localmente.", variant: "destructive"});
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setMainGoal(''); // Clear goal when changing date
    setAiPlan(null);  // Clear AI plan when changing date
  };

  const openNewEventDialog = () => {
    if (!selectedDate) {
        toast({title: "Selecione uma Data", description: "Por favor, selecione uma data no calendário primeiro.", variant: "default"});
        return;
    }
    setIsEditingEvent(null);
    setEventTitle('');
    // Set default time to next hour or 09:00 if far in future/past
    const now = new Date();
    const defaultEventTime = format(addHours(now, 1), 'HH:00');
    setEventTime(defaultEventTime);
    setEventDescription('');
    setIsEventDialogOpen(true);
  };

  const openEditEventDialog = (event: CalendarEvent) => {
    setIsEditingEvent(event);
    setEventTitle(event.title);
    setEventTime(event.time);
    setEventDescription(event.description || '');
    setIsEventDialogOpen(true);
  };

  const handleEventSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !eventTitle.trim() || !eventTime) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let updatedEvents;

    if (isEditingEvent) {
      updatedEvents = events.map(ev => 
        ev.id === isEditingEvent.id 
        ? { ...ev, date: dateStr, time: eventTime, title: eventTitle, description: eventDescription } 
        : ev
      );
      toast({ title: "Evento Atualizado!", description: `"${eventTitle}" foi atualizado.`});
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        date: dateStr,
        time: eventTime,
        title: eventTitle,
        description: eventDescription,
      };
      updatedEvents = [...events, newEvent];
      toast({ title: "Evento Adicionado!", description: `"${eventTitle}" foi agendado para ${format(selectedDate, 'dd/MM/yyyy')} às ${eventTime}.`});
    }
    
    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents);
    setIsEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    const eventToDelete = events.find(ev => ev.id === eventId);
    if (!eventToDelete) return;

    const updatedEvents = events.filter(ev => ev.id !== eventId);
    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents);
    toast({ title: "Evento Excluído!", description: `"${eventToDelete.title}" foi removido.`, variant: "default"});
  };

  const handlePlanDay = async () => {
    if (!selectedDate || !mainGoal.trim()) {
      toast({ title: 'Objetivo Necessário', description: 'Por favor, defina seu objetivo principal para o dia.', variant: 'destructive' });
      return;
    }
    setIsLoadingAI(true);
    setError(null);
    setAiPlan(null);
    try {
      const input: DailyPlannerInput = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        mainGoal,
        existingEvents: currentDayEvents,
      };
      const result = await planDayWithAI(input);
      setAiPlan(result);
      toast({ title: 'Plano Diário Gerado!', description: 'A IA preparou um plano e uma citação para você.', variant: 'default' });
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar o plano diário com IA. Tente novamente.');
      toast({ title: 'Erro no Planejamento', description: 'A IA não conseguiu gerar o plano.', variant: 'destructive' });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getEventDateTime = (event: CalendarEvent): Date => {
    const [hours, minutes] = event.time.split(':').map(Number);
    let dateTime = parseISO(event.date);
    dateTime = setHours(dateTime, hours);
    dateTime = setMinutes(dateTime, minutes);
    return dateTime;
  };


  return (
    <div>
      <PageTitle
        title="Calendário Inteligente com Planejador Diário IA"
        description="Organize seus eventos, defina seus objetivos diários e deixe a IA ajudar você a criar um plano de ação e encontrar motivação."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Seu Calendário</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ShadCalendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{ 
                eventDay: events.map(e => parseISO(e.date))
              }}
              modifiersClassNames={{
                eventDay: 'bg-primary/20 rounded-full',
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>
                {selectedDate ? `Eventos e Plano para ${format(selectedDate, 'PPP', { locale: ptBR })}` : 'Selecione uma Data'}
                </CardTitle>
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={openNewEventDialog} disabled={!selectedDate}>
                    <CalendarPlus className="mr-2 h-4 w-4" /> Novo Evento
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>{isEditingEvent ? 'Editar Evento' : 'Adicionar Novo Evento'}</DialogTitle>
                    <CardDescription>
                        {selectedDate ? `Para ${format(selectedDate, 'PPP', { locale: ptBR })}` : ''}
                    </CardDescription>
                    </DialogHeader>
                    <form onSubmit={handleEventSubmit} className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="event-title">Título do Evento</Label>
                        <Input id="event-title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="event-time">Hora</Label>
                        <Input id="event-time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="event-description">Descrição (Opcional)</Label>
                        <Textarea id="event-description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} rows={3}/>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">{isEditingEvent ? 'Salvar Alterações' : 'Adicionar Evento'}</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Eventos Agendados:</h3>
                {currentDayEvents.length > 0 ? (
                <ScrollArea className="h-[150px] pr-3">
                    <ul className="space-y-2">
                    {currentDayEvents.map(event => {
                        const eventDateTime = getEventDateTime(event);
                        const isPast = eventDateTime < new Date() && !isEqual(startOfDay(eventDateTime), startOfDay(new Date()));
                        return (
                        <li key={event.id} className={`p-3 rounded-md border flex justify-between items-start ${isPast ? 'bg-muted/50 opacity-70' : 'bg-muted/20'}`}>
                            <div>
                            <p className={`font-semibold ${isPast ? 'line-through' : ''}`}>{event.time} - {event.title}</p>
                            {event.description && <p className={`text-sm text-muted-foreground ${isPast ? 'line-through' : ''}`}>{event.description}</p>}
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditEventDialog(event)} title="Editar Evento">
                                    <Edit3 className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleDeleteEvent(event.id)} title="Excluir Evento">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        </li>
                        );
                    })}
                    </ul>
                </ScrollArea>
                ) : (
                <p className="text-muted-foreground">Nenhum evento para este dia.</p>
                )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mainGoal" className="text-lg font-semibold">Seu Objetivo Principal para Hoje:</Label>
              <Textarea
                id="mainGoal"
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                placeholder="Ex: Concluir o relatório X, Estudar 2 capítulos de Y, Fazer exercícios Z"
                disabled={isLoadingAI || !selectedDate}
                rows={2}
              />
              <Button onClick={handlePlanDay} disabled={isLoadingAI || !mainGoal.trim() || !selectedDate}>
                {isLoadingAI && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Sparkles className="mr-2 h-4 w-4"/> Planejar Dia com IA
              </Button>
            </div>

            {error && (
              <div className="text-destructive p-3 bg-destructive/10 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" /> {error}
              </div>
            )}

            {aiPlan && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Plano de Ação Sugerido pela IA:</h3>
                   <Card className="p-4 bg-primary/5">
                     <MarkdownRenderer content={aiPlan.actionPlan} />
                   </Card>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Citação Motivacional do Dia:</h3>
                  <Card className="p-4 bg-primary/5 italic">
                     <MarkdownRenderer content={aiPlan.motivationalQuote} />
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
