# Ponto.com — Protótipo visual

Este é um protótipo estático e gratuito para validar a aparência e a navegação inicial do Ponto.com.

## O que já está incluído
- Painel master ilustrativo da KR Contábil
- Listagem de empresas e funcionários fictícios
- Tela de dispositivos autorizados (simulação)
- Listagem de marcações fictícias
- Prévia da tela PWA do funcionário
- Navegação responsiva para desktop e celular
- Manifest e service worker iniciais para instalação como PWA

## Importante
Esta versão é **somente uma demonstração visual**:
- Não possui backend nem banco de dados.
- Não autentica usuários.
- Não salva cadastros.
- Não autoriza dispositivos reais.
- Não registra jornada oficial e não atende, por si só, aos requisitos legais de um sistema eletrônico de ponto.
- Não utilize dados pessoais ou dados reais de funcionários nesta versão.

## Como testar
1. Extraia o arquivo ZIP.
2. Abra `index.html` no navegador para ver a interface.
3. Para testar instalação PWA e service worker, publique em um host estático compatível com HTTPS ou use um servidor local.

## Próxima etapa técnica
Conectar um backend e PostgreSQL, implementar autenticação e isolamento multiempresa, registrar eventos com integridade e auditoria, e validar os requisitos legais da modalidade de REP antes de qualquer uso oficial.
