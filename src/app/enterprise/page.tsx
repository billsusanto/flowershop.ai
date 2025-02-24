"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PendingOrder {
  id: number;
  imageUrl: string;
  prompt: string;
  userId: number;
  createdAt: string;
  status: string;
}

export default function EnterprisePage() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/purchase');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      // Separate orders by status
      setPendingOrders(data.orders.filter((order: PendingOrder) => order.status === 'pending'));
      setAcceptedOrders(data.orders.filter((order: PendingOrder) => order.status === 'accepted'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/purchase/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve order');
      }

      // Refresh orders after approval
      await fetchOrders();
    } catch (err) {
      console.error('Error approving order:', err);
      alert('Failed to approve order');
    }
  };

  const handleReject = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/purchase/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject order');
      }

      // Refresh orders after rejection
      await fetchOrders();
    } catch (err) {
      console.error('Error rejecting order:', err);
      alert('Failed to reject order');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const OrderCard = ({ order, showActions = false }: { order: PendingOrder, showActions?: boolean }) => (
    <div key={order.id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <div className="relative h-64 w-full">
        <Image
          src={order.imageUrl}
          alt={order.prompt}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Order #{order.id}
          </span>
          <span className={`px-2 py-1 text-sm rounded-full ${
            order.status === 'accepted' 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.status}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 mb-2 line-clamp-3">
          {order.prompt}
        </p>
        
        <div className="text-xs text-gray-500">
          Created: {new Date(order.createdAt).toLocaleString()}
        </div>
        
        {showActions && (
          <div className="mt-4 flex gap-2">
            <button 
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              onClick={() => handleApprove(order.id)}
            >
              Approve
            </button>
            <button 
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              onClick={() => handleReject(order.id)}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pending Orders Section */}
      <h1 className="text-3xl text-black font-bold mb-8">Pending Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {pendingOrders.map((order) => (
          <OrderCard key={order.id} order={order} showActions={true} />
        ))}
        {pendingOrders.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No pending orders found
          </div>
        )}
      </div>

      {/* Accepted Orders Section */}
      <h2 className="text-2xl text-black font-bold mb-8">Accepted Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {acceptedOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {acceptedOrders.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No accepted orders found
          </div>
        )}
      </div>
    </div>
  );
}