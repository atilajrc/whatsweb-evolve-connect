
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Wifi, WifiOff, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EvolutionApiConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

interface EvolutionApiConfigProps {
  onConfigSaved: (config: EvolutionApiConfig) => void;
  isConnected: boolean;
}

const EvolutionApiConfig = ({ onConfigSaved, isConnected }: EvolutionApiConfigProps) => {
  const [config, setConfig] = useState<EvolutionApiConfig>({
    baseUrl: '',
    apiKey: '',
    instanceName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar configuração salva do localStorage
    const savedConfig = localStorage.getItem('evolutionApiConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = async () => {
    if (!config.baseUrl || !config.apiKey || !config.instanceName) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      // Salvar no localStorage
      localStorage.setItem('evolutionApiConfig', JSON.stringify(config));
      
      // Testar conexão
      const response = await fetch(`${config.baseUrl}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Configuração salva e conexão testada com sucesso!');
        onConfigSaved(config);
      } else {
        toast.error('Configuração salva, mas falha na conexão. Verifique os dados.');
      }
    } catch (error) {
      toast.error('Erro ao testar conexão. Verifique a URL e conectividade.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EvolutionApiConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração Evolution API
        </CardTitle>
        <CardDescription>
          Configure sua instância da Evolution API para integração
        </CardDescription>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="h-3 w-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="baseUrl">URL Base da API</Label>
          <Input
            id="baseUrl"
            placeholder="https://api.evolution.com"
            value={config.baseUrl}
            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sua-api-key-aqui"
            value={config.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instanceName">Nome da Instância</Label>
          <Input
            id="instanceName"
            placeholder="minha-instancia"
            value={config.instanceName}
            onChange={(e) => handleInputChange('instanceName', e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Testando...' : 'Salvar e Testar Conexão'}
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>URL Base:</strong> Endereço do seu servidor Evolution API</p>
          <p><strong>API Key:</strong> Chave de autenticação da Evolution API</p>
          <p><strong>Instância:</strong> Nome da instância do WhatsApp</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionApiConfig;
