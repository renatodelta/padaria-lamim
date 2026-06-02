# Implementação: 4 Melhorias no Sistema Padaria Lamim

## Descrição

Quatro melhorias integradas ao sistema: armazenamento de imagens no Supabase Storage, upload de imagens no dashboard, rastreamento de pedidos no app cliente e renomeação de coluna no kanban.

## Mudanças Propostas

---

### 1. Renomear "Na Cozinha" → "Preparando" (Dashboard)

#### [MODIFY] [index.html](file:///c:/xampp/htdocs/padaria-lamim/apps/dashboard/index.html)
- Linhas 221, 272: Alterar o texto `Na Cozinha` para `Preparando`
- Linha 266: Atualizar comentário HTML

---

### 2. Supabase Storage para imagens de produtos (Dashboard + Backend)

> [!IMPORTANT]
> É necessário criar o bucket `padaria-lamim` no Supabase Storage com política de acesso **público de leitura**. Isso precisa ser feito manualmente no painel do Supabase (Storage > New Bucket > nome: `padaria-lamim` > Public: ✅).

#### [MODIFY] [index.html](file:///c:/xampp/htdocs/padaria-lamim/apps/dashboard/index.html)
- Substituir o campo `<input type="url" id="form-product-image">` por:
  - Um botão de upload de arquivo (input type="file")
  - Preview da imagem selecionada
  - Campo URL oculto (mantido para edição de produtos existentes)

#### [MODIFY] [app.js](file:///c:/xampp/htdocs/padaria-lamim/apps/dashboard/app.js)
- Adicionar lógica de upload no evento `change` do file input:
  - Ler o arquivo selecionado
  - Fazer preview local
- No `formProduct.onsubmit`:
  - Se houver arquivo selecionado: fazer upload para `supabaseClient.storage.from('padaria-lamim').upload()`
  - Obter URL pública com `.getPublicUrl()`
  - Salvar a URL pública no campo `image` do produto
  - Se não houver arquivo: manter a URL existente

---

### 3. Rastreamento de pedido no App do Cliente

O fluxo de status dos pedidos no banco:
```
pendente → preparando → pronto → a_caminho → entregue
```

Mapeamento visual para o cliente:
| Status DB | Label Cliente | Ícone |
|-----------|--------------|-------|
| `pendente` | Solicitado | ⏳ |
| `preparando` | Aceito · Preparando | 🍳 |
| `pronto` | Pronto para Entrega | ✅ |
| `a_caminho` | Saiu para Entrega | 🛵 |
| `entregue` | Entregue! | 🎉 |

#### [MODIFY] [index.html](file:///c:/xampp/htdocs/padaria-lamim/apps/cliente/index.html)
- Na tela de sucesso, substituir o botão "Voltar para a Loja" por dois botões:
  - **"Acompanhar Pedido"** (abre o rastreador)
  - **"Voltar para a Loja"** (já existe)
- Adicionar seção de rastreamento dentro da tela de sucesso:
  - Barra de progresso com 5 etapas
  - Status atual em destaque
  - Atualização em tempo real via Supabase Realtime

#### [MODIFY] [style.css](file:///c:/xampp/htdocs/padaria-lamim/apps/cliente/style.css)
- Estilos para o rastreador de pedido (stepper visual)

#### [MODIFY] [app.js](file:///c:/xampp/htdocs/padaria-lamim/apps/cliente/app.js)
- Após pedido ser criado com sucesso:
  - Armazenar `currentOrder.id` 
  - Mostrar tela de rastreamento automaticamente
  - Assinar canal Supabase Realtime para mudanças de `pedidos` onde `id = currentOrder.id`
  - Atualizar o stepper a cada mudança de status
- Limpar a subscription quando voltar para a loja

---

### 4. Imagens dos bolos existentes → Supabase Storage

> [!NOTE]
> As imagens já extraídas (`apps/cliente/bolos/*.jpg`) continuam funcionando localmente. A migração para o Supabase Storage dos produtos existentes pode ser feita gradualmente pelo Dashboard conforme forem sendo editados.

## Verificação

### Automatizada
- Recarregar o app cliente e verificar que a tela de rastreamento aparece após pedido
- Abrir o dashboard e verificar que "Preparando" aparece no kanban
- Cadastrar um novo produto com imagem do computador e verificar upload no Supabase Storage

### Manual (Supabase)
1. Criar o bucket `padaria-lamim` no painel do Supabase (Storage > New Bucket)
2. Marcar como **público** para que as URLs funcionem no app

## Open Questions

> [!IMPORTANT]
> O bucket `padaria-lamim` precisa ser criado manualmente no Supabase antes do upload funcionar. Você tem acesso ao painel do Supabase para criar o bucket, ou prefere que eu use um nome de bucket diferente que já exista?
