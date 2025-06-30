import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, MessageCircle, Users, Archive, Star, Settings, LogOut, Send, Paperclip, Smile, Mic, Phone, Video, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import EvolutionApiConfig from './EvolutionApiConfig';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
  isOnline: boolean;
  phone: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isFromMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

const WhatsAppWeb = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [evolutionConfig, setEvolutionConfig] = useState<ApiConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verificar se há configuração salva ao carregar
  useEffect(() => {
    const savedConfig = localStorage.getItem('evolutionApiConfig');
    if (savedConfig) {
      setEvolutionConfig(JSON.parse(savedConfig));
      setIsConnected(true);
    }
  }, []);

  // Mock data para contatos - mantém os dados existentes
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'João Silva',
      lastMessage: 'Oi! Como você está?',
      timestamp: '14:30',
      unreadCount: 2,
      isOnline: true,
      phone: '+55 11 99999-9999',
    },
    {
      id: '2',
      name: 'Maria Santos',
      lastMessage: 'Reunião às 15h confirmada',
      timestamp: '13:45',
      unreadCount: 0,
      isOnline: false,
      phone: '+55 11 88888-8888',
    },
    {
      id: '3',
      name: 'Pedro Costa',
      lastMessage: 'Obrigado pela ajuda!',
      timestamp: '12:20',
      unreadCount: 1,
      isOnline: true,
      phone: '+55 11 77777-7777',
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      lastMessage: 'Vamos nos encontrar amanhã?',
      timestamp: '11:15',
      unreadCount: 0,
      isOnline: false,
      phone: '+55 11 66666-6666',
    },
    {
      id: '5',
      name: 'Carlos Lima',
      lastMessage: 'Projeto finalizado com sucesso!',
      timestamp: 'Ontem',
      unreadCount: 3,
      isOnline: true,
      phone: '+55 11 55555-5555',
    },
  ]);

  const handleConfigSaved = (config: ApiConfig) => {
    setEvolutionConfig(config);
    setIsConnected(true);
    setIsConfigOpen(false);
  };

  // Mock messages para o contato selecionado
  useEffect(() => {
    if (selectedContact) {
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Oi! Como você está?',
          timestamp: '14:25',
          isFromMe: false,
          status: 'read',
        },
        {
          id: '2',
          content: 'Estou bem, obrigado! E você?',
          timestamp: '14:26',
          isFromMe: true,
          status: 'read',
        },
        {
          id: '3',
          content: 'Também estou bem! Vamos nos encontrar hoje?',
          timestamp: '14:28',
          isFromMe: false,
          status: 'read',
        },
        {
          id: '4',
          content: 'Claro! Que horas seria bom para você?',
          timestamp: '14:29',
          isFromMe: true,
          status: 'delivered',
        },
      ];
      setMessages(mockMessages);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isFromMe: true,
        status: 'sent',
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-1/3 max-w-md bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt="Meu perfil" />
                <AvatarFallback className="bg-green-500 text-white">EU</AvatarFallback>
              </Avatar>
              <span className="font-medium">Meu WhatsApp</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Users className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <EvolutionApiConfig 
                    onConfigSaved={handleConfigSaved}
                    isConnected={isConnected}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Pesquisar conversas"
              className="pl-10 bg-white dark:bg-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
              <Archive className="h-4 w-4 mr-2" />
              Arquivadas
            </Button>
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
              <Star className="h-4 w-4 mr-2" />
              Favoritas
            </Button>
          </div>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1 whatsapp-scrollbar">
          <div className="space-y-1">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-slate-100 dark:bg-slate-600' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback className="bg-slate-300 text-slate-700">
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                      <span className="text-xs text-slate-500">{contact.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{contact.lastMessage}</p>
                      {contact.unreadCount > 0 && (
                        <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                  <AvatarFallback className="bg-slate-300 text-slate-700">
                    {selectedContact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{selectedContact.name}</h2>
                  <p className="text-sm text-slate-500">
                    {selectedContact.isOnline ? 'online' : 'visto por último hoje às 12:30'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 whatsapp-scrollbar">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'} message-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                      message.isFromMe
                        ? 'bg-green-500 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className={`text-xs ${message.isFromMe ? 'text-green-100' : 'text-slate-500'}`}>
                        {message.timestamp}
                      </span>
                      {message.isFromMe && (
                        <div className="flex">
                          {message.status === 'sent' && <div className="w-4 h-3 text-green-100">✓</div>}
                          {message.status === 'delivered' && <div className="w-4 h-3 text-green-100">✓✓</div>}
                          {message.status === 'read' && <div className="w-4 h-3 text-blue-300">✓✓</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="flex-1 flex items-center space-x-2 bg-slate-50 dark:bg-slate-700 rounded-full px-4 py-2">
                <Button variant="ghost" size="sm">
                  <Smile className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Digite uma mensagem"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-0 bg-transparent focus:ring-0 flex-1"
                />
              </div>
              {newMessage.trim() ? (
                <Button 
                  onClick={handleSendMessage}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                >
                  <Send className="h-5 w-5" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm">
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
          <div className="text-center">
            <MessageCircle className="h-24 w-24 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
              WhatsApp Web Clone
            </h2>
            <p className="text-slate-500 dark:text-slate-500">
              Selecione uma conversa para começar a trocar mensagens
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-600 mt-4">
              {isConnected ? 'Conectado com Evolution API' : 'Configure a Evolution API no ícone de configurações'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppWeb;
