# Tech Challenge - Fast Food System

[Apresentação FIAP - Fase 2](https://youtu.be/vD4L3E_Gviw)

## Descrição do Projeto

O **Tech Challenge** é um projeto desenvolvido como parte da entrega da Pós-Graduação na FIAP. O objetivo é criar um sistema de autoatendimento para uma lanchonete em expansão, que visa melhorar a experiência do cliente e otimizar o gerenciamento de pedidos. O sistema permitirá que os clientes façam pedidos de forma rápida e eficiente, enquanto o estabelecimento poderá gerenciar pedidos com mais eficácia.

### Problema

Com o crescimento da lanchonete, a falta de um sistema de controle de pedidos pode levar a confusões e insatisfação dos clientes. Este projeto aborda essas questões, oferecendo uma solução que integra pedidos e acompanhamento em tempo real de forma escalável e performática.

## Funcionalidades

- **Pedido**: Interface para os clientes montarem seus pedidos de forma intuitiva.
- ⚠️ **Acompanhamento**: Atualizações em tempo real sobre o status do pedido.

## Estrutura do Projeto

- **Backend**: Microserviço utilizando arquitetura hexagonal.
- **APIs Implementadas**:
    - Criação, edição e remoção de pedidos
    - Listagem de pedidos
- **Banco de Dados**: MySQL para armazenamento das informações dos pedidos.

## Como Rodar o Projeto Localmente

Para iniciar o projeto, você precisará ter o Docker e o Docker Compose instalados. Siga os passos abaixo:

1. Clone o repositório:

```bash
   git clone https://github.com/Fiap-pos-tech-2024/Fast-Food-Order.git
   cd Fast-Food-Order
```

2. Construa e inicie os containers:

```bash
    docker-compose up --build
```

3. Acesse a aplicação em http://localhost:3000

## Documentação da API

A documentação das APIs está disponível via Swagger. Após iniciar o projeto, você pode acessá-la em http://localhost:3000/api-docs.

## Regras de negócio

Confira no passo-a-passo a seguir um fluxo de geração de pedido.

### Criar pedido

Para criar um pedido, utilize o endpoint abaixo. Caso não seja informado id do cliente, o pedido será criado de forma anônima.

```bash
POST
curl --location 'http://localhost:3000/order' \
--header 'Content-Type: application/json' \
--data-raw '{
    "idClient": "678b039fafba99ba4720f853",
    "cpf": "01234567897",
    "name": "john doe",
    "email": "john@teste.com",
    "value": 10,
    "items": [
        {
            "id": 1,
            "name": "Coca-Cola",
            "price": 10,
            "quantity": 1
        }
    ]
}'
```

### Consultar status do pedido

Após criar o pedido, você pode consultar o status utilizando o id do pedido gerado.

```bash
GET
curl --location 'http://localhost:3000/order/:idOrder' \
--data ''
```
