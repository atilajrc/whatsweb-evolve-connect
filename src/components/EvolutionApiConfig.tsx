
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Wifi, WifiOff, Save, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Carregar configuração salva do localStorage
    const savedConfig = localStorage.getItem('evolutionApiConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const testConnection = async (testConfig: EvolutionApiConfig) => {
    console.log('Testando conexão com:', testConfig);
    
    try {
      // Limpar barra final se existir
      const baseUrl = testConfig.baseUrl.replace(/\/$/, '');
      const testUrl = `${baseUrl}/instance/fetchInstances`;
      
      console.log('URL de teste:', testUrl);
      setTestResult(`Testando: ${testUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'apikey': testConfig.apiKey,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Resposta da API:', data);
        setTestResult('✅ Conexão estabelecida com sucesso!');
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        setTestResult(`❌ Erro ${response.status}: ${errorText || 'Resposta inválida'}`);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error: any) {
      console.error('Erro na conexão:', error);
      
      if (error.name === 'AbortError') {
        setTestResult('❌ Timeout - O servidor não respondeu em 10 segundos');
        return { success: false, error: 'Timeout' };
      }
      
      if (error.message.includes('Failed to fetch')) {
        setTestResult('❌ Falha na conexão - Verifique se o servidor está rodando e acessível');
        return { success: false, error: 'Network error' };
      }
      
      setTestResult(`❌ Erro: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const handleSave = async () => {
    if (!config.baseUrl || !config.apiKey || !config.instanceName) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    setTestResult('Iniciando teste de conexão...');

    try {
      // Salvar no localStorage primeiro
      localStorage.setItem('evolutionApiConfig', JSON.stringify(config));
      
      // Testar conexão
      const result = await testConnection(config);

      if (result.success) {
        toast.success('Configuração salva e conexão testada com sucesso!');
        onConfigSaved(config);
      } else {
        toast.error(`Configuração salva, mas falha na conexão: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast.error(`Erro inesperado: ${error.message}`);
      setTestResult(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EvolutionApiConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(''); // Limpar resultado anterior quando mudar configuração
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
            placeholder="http://100.100.46.98:8080"
            value={config.baseUrl}
            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Exemplo: http://100.100.46.98:8080 (sem barra no final)
          </p>
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
        
        {testResult && (
          <div className={`p-3 rounded-md text-sm ${
            testResult.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}
        
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Testando conexão...' : 'Salvar e Testar Conexão'}
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>URL Base:</strong> Endereço completo do servidor (ex: http://100.100.46.98:8080)</p>
          <p><strong>API Key:</strong> Chave de autenticação da Evolution API</p>
          <p><strong>Instância:</strong> Nome da instância do WhatsApp</p>
          <p><strong>Dica:</strong> Verifique se o servidor está rodando e se a porta está acessível</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionApiConfig;
