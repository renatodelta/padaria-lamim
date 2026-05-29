# Padaria Lamim - Sistema de Vendas

Sistema de delivery e gestão de pedidos composto por três módulos (cliente, dashboard e motoboy) organizados em um monorepo.

## Estrutura de Diretórios

- **[apps/cliente/](file:///c:/xampp/htdocs/padaria-lamim/apps/cliente)**: Interface pública de compras dos clientes (`padarialamim.com`). O cliente monta seu carrinho, seleciona a forma de entrega/pagamento e envia o pedido.
- **[apps/dashboard/](file:///c:/xampp/htdocs/padaria-lamim/apps/dashboard)**: Dashboard centralizado de vendas e estoque (`pedidos.padarialamim.com` / `dashboard.padarialamim.com`). Permite gerenciar novos pedidos, atualizar a cozinha, cadastrar produtos e ajustar estoques.
- **[apps/motoboy/](file:///c:/xampp/htdocs/padaria-lamim/apps/motoboy)**: Interface mobile-first para os entregadores (`motoboy.padarialamim.com`). Permite aceitar entregas, visualizar detalhes do endereço e marcar o pedido como entregue.

## Tecnologias e Arquitetura

- **Frontend:** HTML5 semântico, CSS3 personalizado e Vanilla JavaScript (ES6+).
- **Hospedagem Recomendada:** Cloudflare Pages (com deploy independente para cada subdiretório em `apps/`).
- **Banco de Dados & Realtime:** Sugerido Supabase ou Firebase (SDK JS direto nos apps).

## Como rodar localmente

Cada pasta dentro de `apps/` é independente. Você pode abrir o XAMPP e configurar virtual hosts para cada domínio/subdomínio local, ou utilizar o Live Server (VS Code) para rodar cada pasta de forma isolada.
