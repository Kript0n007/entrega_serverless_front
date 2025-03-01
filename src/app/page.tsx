"use client";
export const dynamic = "force-static";

import { useState, useEffect } from "react";

const API_URL = "https://us-central1-facu-serverless.cloudfunctions.net/serverless/orders";

interface Pedido {
  id: string;
  cliente: string;
  email: string;
  total: number;
  status: string;
}

export default function Home() {
  const [cliente, setCliente] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [produto, setProduto] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [preco, setPreco] = useState<number>(0);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [responseData, setResponseData] = useState<string | null>(null); // Exibir JSON das respostas

  useEffect(() => {
    fetchPedidos();
  }, []);

  // Buscar todos os pedidos
  const fetchPedidos = async () => {
    try {
      const response = await axios.get<Pedido[]>(`${API_URL}/all`);
      setPedidos(response.data);
      setResponseData(JSON.stringify(response.data, null, 2));
    } catch (error) {
      tratarErro(error);
    }
  };

  // Criar pedido
  const criarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    const novoPedido = {
      cliente,
      email,
      itens: [{ produto, quantidade, preco }],
    };

    try {
      const response = await axios.post(API_URL, novoPedido);
      alert("Pedido criado com sucesso!");
      setResponseData(JSON.stringify(response.data, null, 2));
      limparCampos();
      fetchPedidos();
    } catch (error) {
      tratarErro(error);
    }
  };

  // Atualizar status do pedido
  const atualizarStatus = async (id: string, status: string) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      alert("Status atualizado com sucesso!");
      setResponseData(JSON.stringify(response.data, null, 2));
      fetchPedidos();
    } catch (error) {
      tratarErro(error);
    }
  };

  // Deletar pedido
  const deletarPedido = async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      alert("Pedido deletado com sucesso!");
      setResponseData(JSON.stringify(response.data, null, 2));
      fetchPedidos();
    } catch (error) {
      tratarErro(error);
    }
  };

  // Função auxiliar para limpar campos do formulário
  const limparCampos = () => {
    setCliente("");
    setEmail("");
    setProduto("");
    setQuantidade(1);
    setPreco(0);
  };

  // Função para tratar erros de requisição
  const tratarErro = (error: unknown) => {
    console.error("Erro:", error);
    if (axios.isAxiosError(error)) {
      setResponseData(JSON.stringify(error.response?.data || error.message, null, 2));
    } else {
      setResponseData(JSON.stringify("Erro desconhecido", null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Pedidos</h1>

      <form onSubmit={criarPedido} className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Criar Novo Pedido</h2>
        <input
          type="text"
          placeholder="Nome do Cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="w-full p-2 mb-2 border rounded text-gray-900"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded text-gray-900"
          required
        />
        <input
          type="text"
          placeholder="Produto"
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
          className="w-full p-2 mb-2 border rounded text-gray-900"
          required
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          className="w-full p-2 mb-2 border rounded text-gray-900"
          required
        />
        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(Number(e.target.value))}
          className="w-full p-2 mb-2 border rounded text-gray-900"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Criar Pedido
        </button>
      </form>

      {/* Lista de Pedidos */}
      <div className="mt-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Lista de Pedidos</h2>
        {pedidos.length > 0 ? (
          <ul className="bg-white p-6 rounded-lg shadow-md text-gray-900">
            {pedidos.map((pedido) => (
              <li key={pedido.id} className="border-b p-2 flex justify-between items-center">
                <div>
                  <strong>{pedido.cliente}</strong> - {pedido.total} USD - {pedido.status}
                </div>
                <div>
                  <button
                    onClick={() => atualizarStatus(pedido.id, "PROCESSANDO")}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Processar
                  </button>
                  <button
                    onClick={() => atualizarStatus(pedido.id, "ENVIADO")}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Enviar
                  </button>
                  <button
                    onClick={() => deletarPedido(pedido.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Deletar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-900">Nenhum pedido encontrado.</p>
        )}
      </div>

      {/* Exibir o JSON de cada requisição */}
      <div className="mt-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Resposta JSON</h2>
        {responseData ? (
          <pre className="bg-black text-white p-4 rounded overflow-auto h-64">
            {responseData}
          </pre>
        ) : (
          <p className="text-gray-900">Nenhuma resposta ainda.</p>
        )}
      </div>
    </div>
  );
}
