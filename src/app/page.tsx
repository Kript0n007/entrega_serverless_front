"use client";
export const dynamic = "force-static";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://us-central1-facu-serverless.cloudfunctions.net/serverless/orders";

// Definição do tipo Pedido
interface Pedido {
  id: string;
  cliente: string;
  email: string;
  itens: { produto: string; quantidade: number; preco: number }[];
  total: number;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
}

export default function Home() {
  const [cliente, setCliente] = useState("");
  const [email, setEmail] = useState("");
  const [produto, setProduto] = useState("");
  const [quantidade, setQuantidade] = useState<number | undefined>();
  const [preco, setPreco] = useState<number | undefined>();
  const [pedidos, setPedidos] = useState<Pedido[]>([]); // Agora corretamente tipado
  const [responseData, setResponseData] = useState<string | null>(null); // Definição correta

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      setPedidos(response.data);
      setResponseData(JSON.stringify(response.data, null, 2));
    } catch (error: unknown) {
      console.error("Erro ao buscar pedidos:", error);
      if (axios.isAxiosError(error)) {
        setResponseData(JSON.stringify(error.response?.data || error.message, null, 2));
      } else {
        setResponseData(JSON.stringify("Erro desconhecido", null, 2));
      }
    }
  };

  const criarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    const novoPedido = {
      cliente,
      email,
      itens: [{ produto, quantidade: Number(quantidade), preco: Number(preco) }],
    };

    try {
      const response = await axios.post(API_URL, novoPedido);
      alert("Pedido criado com sucesso!");
      setResponseData(JSON.stringify(response.data, null, 2));
      setCliente("");
      setEmail("");
      setProduto("");
      setQuantidade(undefined);
      setPreco(undefined);
      fetchPedidos();
    } catch (error: unknown) {
      console.error("Erro ao criar pedido:", error);
      if (axios.isAxiosError(error)) {
        setResponseData(JSON.stringify(error.response?.data || error.message, null, 2));
      } else {
        setResponseData(JSON.stringify("Erro desconhecido", null, 2));
      }
    }
  };

  const atualizarStatus = async (id: string, status: string) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      alert("Status atualizado com sucesso!");
      setResponseData(JSON.stringify(response.data, null, 2));
      fetchPedidos();
    } catch (error: unknown) {
      console.error("Erro ao atualizar status:", error);
      if (axios.isAxiosError(error)) {
        setResponseData(JSON.stringify(error.response?.data || error.message, null, 2));
      } else {
        setResponseData(JSON.stringify("Erro desconhecido", null, 2));
      }
    }
  };

  const deletarPedido = async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      alert("Pedido deletado com sucesso!");
      setResponseData(JSON.stringify(response.data, null, 2));
      fetchPedidos();
    } catch (error: unknown) {
      console.error("Erro ao deletar pedido:", error);
      if (axios.isAxiosError(error)) {
        setResponseData(JSON.stringify(error.response?.data || error.message, null, 2));
      } else {
        setResponseData(JSON.stringify("Erro desconhecido", null, 2));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Pedidos</h1>

      <form
        onSubmit={criarPedido}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Criar Novo Pedido
        </h2>
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
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Lista de Pedidos
        </h2>
        {pedidos.length > 0 ? (
          <ul className="bg-white p-6 rounded-lg shadow-md text-gray-900">
            {pedidos.map((pedido) => (
              <li
                key={pedido.id}
                className="border-b p-2 flex justify-between items-center"
              >
                <div>
                  <strong>{pedido.cliente}</strong> - {pedido.total} USD -{" "}
                  {pedido.status}
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
    </div>
  );
}
