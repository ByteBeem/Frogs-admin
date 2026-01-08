"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Package, Tag, Image as ImageIcon, DollarSign } from "lucide-react";

// Import Layout Components
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

// --- Types ---
interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  badge: string;
  image: string;
  description: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    price: 0,
    category: "Components",
    badge: "New",
    image: "/placeholder.png", 
    description: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts(); 
        setNewProduct({ name: "", price: 0, category: "Components", badge: "", image: "", description: "" });
      } else {
        alert("Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Layout */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* 3. Topbar */}
        <Topbar />

        {/* 4. Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Inventory</h1>
              <p className="text-slate-500 mt-1">Manage your product catalog.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No products found. Add your first item!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 group hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                >
                  {/* Image Area */}
                  <div className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100">
                    {product.image && product.image !== '/placeholder.png' ? (
                       <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                       <Package className="text-slate-300 w-12 h-12" />
                    )}
                    
                    {product.badge && (
                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-emerald-600 shadow-sm border border-emerald-100 text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wide">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  
                  {/* Info Area */}
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-slate-800 leading-tight line-clamp-1" title={product.name}>
                        {product.name}
                      </h3>
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-sm">
                        R{product.price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium flex items-center gap-1">
                      <Tag size={12} /> {product.category}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Product Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-all">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateProduct} className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Product Name</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Raspberry Pi 5"
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <DollarSign size={14} className="text-slate-400" /> Price (R)
                        </label>
                        <input 
                          type="number"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={newProduct.price}
                          onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Tag size={14} className="text-slate-400" /> Category
                        </label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                          value={newProduct.category}
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        >
                          <option value="Components">Components</option>
                          <option value="Tools">Tools</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <ImageIcon size={14} className="text-slate-400" /> Image URL
                      </label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="https://..."
                        value={newProduct.image}
                        onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                      />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
