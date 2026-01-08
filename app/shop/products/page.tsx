"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, Package, Tag, Image as ImageIcon, 
  DollarSign, Upload, Loader2, Trash2, AlertTriangle 
} from "lucide-react";

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
  
  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null); // Track which item to delete
  
  // Loading States
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form State
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    price: 0,
    category: "Components",
    badge: "New",
    image: "", 
    description: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // --- DELETE PRODUCT HANDLER ---
  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`https://api.blackfroglabs.co.za/api/products/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from local state immediately
        setProducts(products.filter(p => p.id !== deleteId));
        setDeleteId(null); // Close modal
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error connecting to server");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- S3 FILE UPLOAD HANDLER ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const res = await fetch("https://api.blackfroglabs.co.za/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName: file.name, 
          fileType: file.type 
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, fileUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (uploadRes.ok) {
        setNewProduct((prev) => ({ ...prev, image: fileUrl }));
      } else {
        console.error("S3 Upload failed");
        alert("Failed to upload image. Check S3 CORS settings.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  // --- CREATE PRODUCT ---
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productToSave = {
        ...newProduct,
        image: newProduct.image || ""
      };

      const res = await fetch("https://api.blackfroglabs.co.za/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
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
      <Sidebar />

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
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
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 group hover:shadow-lg hover:border-emerald-200 transition-all duration-300 relative"
                >
                  <div className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:border-emerald-100 transition-colors">
                    
                    {/* Delete Button (Visible on Hover) */}
                    <button
                      onClick={() => setDeleteId(product.id!)}
                      className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur text-red-500 p-1.5 rounded-lg shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 active:scale-95"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>

                    {product.image ? (
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

          {/* --- CONFIRM DELETE MODAL --- */}
          <AnimatePresence>
            {deleteId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Delete Product?</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Are you sure you want to delete this product? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                      <button 
                        onClick={() => setDeleteId(null)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDeleteProduct}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* --- ADD PRODUCT MODAL (Existing) --- */}
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
                    
                    {/* --- NAME --- */}
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

                    {/* --- PRICE & CATEGORY --- */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <DollarSign size={14} className="text-slate-400" /> Price (R)
                        </label>
                        <input 
                          type="number"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={newProduct.price === 0 ? "" : newProduct.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewProduct({
                              ...newProduct, 
                              price: val === "" ? 0 : parseFloat(val)
                            });
                          }}
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

                    {/* --- IMAGE UPLOAD --- */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <ImageIcon size={14} className="text-slate-400" /> Product Image
                      </label>
                      
                      <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="relative w-24 h-24 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-1">
                              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                              <span className="text-[10px] text-slate-400">Uploading</span>
                            </div>
                          ) : newProduct.image ? (
                            <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-xs file:font-semibold
                              file:bg-emerald-50 file:text-emerald-700
                              hover:file:bg-emerald-100 file:cursor-pointer cursor-pointer"
                          />
                          <p className="text-xs text-slate-500">
                             Upload a product image directly to AWS. <br/>
                             <span className="text-slate-400 text-[10px]">Supported: JPG, PNG, WEBP. Max 5MB.</span>
                          </p>
                        </div>
                      </div>
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
                        disabled={isUploading}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? "Uploading..." : "Save Product"}
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
