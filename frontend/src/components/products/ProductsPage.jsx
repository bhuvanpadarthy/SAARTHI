import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Palette,
  Filter,
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  X,
  LayoutGrid,
  List,
  Sparkles,
  PackageCheck,
  PackageX,
  MapPin,
  Info,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductsPage = () => {
  const { products, addProduct, settings } = useApp();

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPackSize, setSelectedPackSize] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Stock Detail modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isStockDetailOpen, setIsStockDetailOpen] = useState(false);

  // Add Product modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Asian Paints',
    category: 'Interior Emulsion',
    packSize: '20 L',
    shadeCode: '',
    shadeHex: '#FDFBF7',
    finish: 'Smooth Sheen',
    unitPrice: '',
    mrp: '',
    currentStock: '10',
    minThreshold: '5',
    distributor: 'Asian Paints Regional Depot',
    locationRack: 'Aisle 1'
  });

  // Unique brands, categories, pack sizes
  const brands = useMemo(() => ['ALL', ...new Set(products.map((p) => p.brand))], [products]);
  const categories = useMemo(() => ['ALL', ...new Set(products.map((p) => p.category))], [products]);
  const packSizes = useMemo(() => ['ALL', ...new Set(products.map((p) => p.packSize))], [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.packSize.toLowerCase().includes(q) ||
        (p.shadeCode && p.shadeCode.toLowerCase().includes(q));

      const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesPack = selectedPackSize === 'ALL' || p.packSize === selectedPackSize;

      let matchesStock = true;
      if (selectedStockStatus === 'LOW') {
        matchesStock = p.currentStock <= (p.minThreshold || settings.lowStockThreshold || 5);
      } else if (selectedStockStatus === 'OUT') {
        matchesStock = p.currentStock === 0;
      } else if (selectedStockStatus === 'IN') {
        matchesStock = p.currentStock > (p.minThreshold || settings.lowStockThreshold || 5);
      }

      return matchesSearch && matchesBrand && matchesCategory && matchesPack && matchesStock;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory, selectedPackSize, selectedStockStatus, settings]);

  // Stock status helper
  const getStockStatus = (product) => {
    if (!product) return { status: 'unknown', label: 'N/A', color: '#94A3B8' };
    const stock = product.currentStock ?? 0;
    const threshold = product.minThreshold || settings.lowStockThreshold || 5;
    if (stock === 0) {
      return { status: 'out', label: 'OUT OF STOCK', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
    }
    if (stock <= threshold) {
      return { status: 'low', label: 'LOW STOCK', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
    }
    return { status: 'in', label: 'IN STOCK', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
  };

  const handleViewStockDetail = (product) => {
    setSelectedProduct(product);
    setIsStockDetailOpen(true);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.shadeCode || !formData.unitPrice) {
      alert('Please fill in required fields: Product Name, Shade Code, and Unit Price.');
      return;
    }

    addProduct({
      ...formData,
      unitPrice: Number(formData.unitPrice),
      mrp: Number(formData.mrp || formData.unitPrice * 1.15),
      currentStock: Number(formData.currentStock || 0),
      minThreshold: Number(formData.minThreshold || 5)
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      brand: 'Asian Paints',
      category: 'Interior Emulsion',
      packSize: '20 L',
      shadeCode: '',
      shadeHex: '#FDFBF7',
      finish: 'Smooth Sheen',
      unitPrice: '',
      mrp: '',
      currentStock: '10',
      minThreshold: '5',
      distributor: 'Asian Paints Regional Depot',
      locationRack: 'Aisle 1'
    });
  };

  return (
    <div className="page-content">
      {/* Top Action Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Paint Catalog & Shades
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Showing {filteredProducts.length} of {products.length} demonstration paint formulations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '3px', display: 'flex' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'grid' ? 'var(--white)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--navy-900)' : 'var(--slate-600)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
              }}
              title="Grid Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'table' ? 'var(--white)' : 'transparent',
                color: viewMode === 'table' ? 'var(--navy-900)' : 'var(--slate-600)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            className="btn btn-accent"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Add Paint Formulation
          </button>
        </div>
      </div>

      {/* Filter / Search Bar Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {/* Search Input */}
            <div className="search-input-wrapper" style={{ gridColumn: 'span 2' }}>
              <Search size={16} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by product name, shade code, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '10px', color: 'var(--slate-400)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div>
              <select
                className="form-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="ALL">All Brands</option>
                {brands.filter((b) => b !== 'ALL').map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Types / Categories</option>
                {categories.filter((c) => c !== 'ALL').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Pack Size Filter */}
            <div>
              <select
                className="form-select"
                value={selectedPackSize}
                onChange={(e) => setSelectedPackSize(e.target.value)}
              >
                <option value="ALL">All Pack Sizes</option>
                {packSizes.filter((p) => p !== 'ALL').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Level Filter */}
            <div>
              <select
                className="form-select"
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="LOW">⚠️ Low Stock Alerts</option>
                <option value="IN">✅ In Stock Safe</option>
                <option value="OUT">❌ Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid or Table Display */}
      {filteredProducts.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Palette size={48} color="var(--slate-400)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: 'var(--navy-900)', marginBottom: '6px' }}>No matching paint products</h3>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Try adjusting your search criteria, brand filter, or pack size selector.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedBrand('ALL');
              setSelectedCategory('ALL');
              setSelectedPackSize('ALL');
              setSelectedStockStatus('ALL');
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredProducts.map((p) => {
            const isLowStock = p.currentStock <= (p.minThreshold || settings.lowStockThreshold || 5);
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  borderTop: `4px solid ${p.shadeHex || 'var(--orange-500)'}`,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative'
                }}
              >
                <div className="card-body" style={{ padding: '20px' }}>
                  {/* Brand & Pack Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge badge-brand">{p.brand}</span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: 'var(--slate-100)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--slate-700)'
                      }}
                    >
                      {p.packSize}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--navy-900)',
                      marginBottom: '4px',
                      lineHeight: '1.3'
                    }}
                  >
                    {p.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '14px' }}>
                    Category: {p.category}
                  </div>

                  {/* Shade Swatch Box */}
                  <div
                    style={{
                      background: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      className="shade-circle"
                      style={{
                        backgroundColor: p.shadeHex || '#FFF',
                        width: '32px',
                        height: '32px'
                      }}
                      title={`Hex: ${p.shadeHex}`}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>
                        Shade Code / Name
                      </div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--navy-900)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {p.shadeCode}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Stock Info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--slate-100)',
                      paddingTop: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Selling Rate</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                        {settings.currency}
                        {p.unitPrice?.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                        MRP: {settings.currency}{p.mrp?.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Rack Stock</div>
                      <div style={{ marginTop: '2px' }}>
                        {isLowStock ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={12} /> {p.currentStock} Tins Left
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle size={12} /> {p.currentStock} In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Availability Check Button */}
                  <div style={{ marginTop: '12px', borderTop: '1px solid var(--slate-100)', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleViewStockDetail(p)}
                      style={{
                        width: '100%',
                        padding: '7px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${getStockStatus(p).border}`,
                        background: getStockStatus(p).bg,
                        color: getStockStatus(p).color,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'opacity 0.15s ease'
                      }}
                      title="View detailed stock availability for this product"
                    >
                      {getStockStatus(p).status === 'in' && <><PackageCheck size={14} /> Available in Shop — View Details</>}
                      {getStockStatus(p).status === 'low' && <><AlertTriangle size={14} /> Low Stock Alert — View Details</>}
                      {getStockStatus(p).status === 'out' && <><PackageX size={14} /> Not Available — View Details</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Color / Shade</th>
                  <th>Product Formulation</th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Pack</th>
                  <th>Unit Rate</th>
                  <th>Balance Stock</th>
                  <th>Status</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.currentStock <= (p.minThreshold || settings.lowStockThreshold || 5);
                  return (
                    <tr key={p.id} className={isLow ? 'row-low-stock' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className="shade-circle"
                            style={{ backgroundColor: p.shadeHex || '#FFF' }}
                            title={`Hex: ${p.shadeHex}`}
                          />
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {p.shadeCode}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                          Finish: {p.finish || 'Standard'} • Rack: {p.locationRack || 'Main'}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-brand">{p.brand}</span>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <strong>{p.packSize}</strong>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--navy-900)' }}>
                          {settings.currency}
                          {p.unitPrice?.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {p.currentStock}
                        </span>{' '}
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>packs</span>
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-danger">Low Stock ({p.currentStock})</span>
                        ) : (
                          <span className="badge badge-success">Adequate</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewStockDetail(p)}
                          style={{ fontSize: '0.73rem', padding: '4px 10px' }}
                          title="Check stock availability"
                        >
                          <Eye size={12} /> Check Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Availability Detail Modal */}
      {isStockDetailOpen && selectedProduct && (() => {
        const status = getStockStatus(selectedProduct);
        const p = selectedProduct;
        return (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '560px' }}>
              <div className="modal-header">
                <div className="modal-title">
                  <PackageCheck size={20} color={status.color} />
                  Stock Availability Details
                </div>
                <button
                  onClick={() => { setIsStockDetailOpen(false); setSelectedProduct(null); }}
                  style={{ color: 'var(--slate-400)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {/* Product Identity Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px',
                  padding: '14px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)'
                }}>
                  <div
                    className="shade-circle"
                    style={{ backgroundColor: p.shadeHex || '#FFF', width: '48px', height: '48px', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                    title={`Hex: ${p.shadeHex}`}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy-900)', marginBottom: '2px' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {p.brand} • {p.packSize} • Shade: {p.shadeCode}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                      {p.category} • {p.finish || 'Standard'} • {settings.currency}{p.unitPrice?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Big Stock Status Badge */}
                <div style={{
                  padding: '18px', borderRadius: 'var(--radius-lg)', background: status.bg,
                  border: `2px solid ${status.border}`, textAlign: 'center', marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                    {status.status === 'in' && <PackageCheck size={28} color={status.color} />}
                    {status.status === 'low' && <AlertTriangle size={28} color={status.color} />}
                    {status.status === 'out' && <PackageX size={28} color={status.color} />}
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: status.color, letterSpacing: '1px' }}>
                      {status.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: status.color }}>
                    {p.currentStock} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>packs</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: status.color, marginTop: '4px' }}>
                    {status.status === 'in' && 'This product is available in the shop. You can sell it.'}
                    {status.status === 'low' && `Running low! Only ${p.currentStock} packs remaining. Reorder soon.`}
                    {status.status === 'out' && 'This product is NOT available. Receive stock from depot first.'}
                  </div>
                </div>

                {/* Detailed Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '4px' }}>
                      Rack Location
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={14} color="var(--orange-500)" /> {p.locationRack || 'Main Shelf'}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '4px' }}>
                      Reorder Alert Level
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                      ≤ {p.minThreshold || settings.lowStockThreshold || 5} packs
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '4px' }}>
                      Selling Price
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '1.05rem' }}>
                      {settings.currency}{p.unitPrice?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '4px' }}>
                      MRP
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--slate-600)', fontSize: '1.05rem', textDecoration: 'line-through' }}>
                      {settings.currency}{p.mrp?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Stock Movement Summary */}
                <div style={{ padding: '14px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '10px' }}>
                    Stock Movement Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-700)' }}>{p.openingStock ?? 0}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', fontWeight: 600 }}>Opening</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>+{p.stockReceived ?? 0}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', fontWeight: 600 }}>Received</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D97706' }}>-{p.soldQuantity ?? 0}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', fontWeight: 600 }}>Sold</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#DC2626' }}>-{p.damagedStock ?? 0}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', fontWeight: 600 }}>Damaged</div>
                    </div>
                  </div>
                </div>

                {/* Distributor */}
                {p.distributor && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                    <Info size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom', color: 'var(--slate-400)' }} />
                    Distributor / Depot: <strong style={{ color: 'var(--navy-900)' }}>{p.distributor}</strong>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsStockDetailOpen(false); setSelectedProduct(null); }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <Palette size={20} color="var(--orange-500)" />
                Add Demonstration Paint Product
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="modal-body">
                <div style={{ background: 'var(--amber-50)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.8rem', color: '#92400E' }}>
                  <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  This will register a new sample paint formulation into your active session catalog.
                </div>

                <div className="form-group">
                  <label className="form-label">Product Commercial Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Royale Matt Luxury Emulsion"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Paint Brand *</label>
                    <select
                      className="form-select"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    >
                      <option value="Asian Paints">Asian Paints</option>
                      <option value="Berger Paints">Berger Paints</option>
                      <option value="Dulux">Dulux</option>
                      <option value="Nerolac">Nerolac</option>
                      <option value="Indigo">Indigo</option>
                      <option value="Dr. Fixit">Dr. Fixit</option>
                      <option value="MRF Corp">MRF Corp</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category / Finish Type *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Interior Emulsion">Interior Emulsion</option>
                      <option value="Exterior Emulsion">Exterior Emulsion</option>
                      <option value="Enamel / Gloss">Enamel / Gloss</option>
                      <option value="Primer & Undercoat">Primer & Undercoat</option>
                      <option value="Waterproofing & Chemical">Waterproofing & Chemical</option>
                      <option value="Distemper & Economy">Distemper & Economy</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Pack Container Size *</label>
                    <select
                      className="form-select"
                      value={formData.packSize}
                      onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    >
                      <option value="1 L">1 L Tin</option>
                      <option value="4 L">4 L Bucket</option>
                      <option value="10 L">10 L Bucket</option>
                      <option value="20 L">20 L Drum</option>
                      <option value="15 Kg">15 Kg Bag/Bucket</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shade Code & Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. 0914 Royal Pearl"
                      value={formData.shadeCode}
                      onChange={(e) => setFormData({ ...formData, shadeCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Shade Visual Color Preview</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="color"
                        style={{ width: '44px', height: '38px', padding: '2px', border: '1px solid var(--slate-300)', borderRadius: '6px', cursor: 'pointer' }}
                        value={formData.shadeHex}
                        onChange={(e) => setFormData({ ...formData, shadeHex: e.target.value })}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="#HEX Color"
                        value={formData.shadeHex}
                        onChange={(e) => setFormData({ ...formData, shadeHex: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Finish / Sheen</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. High Gloss, Matte, Satin"
                      value={formData.finish}
                      onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Selling Price ({settings.currency}) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-control"
                      placeholder="e.g. 4200"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">MRP Print ({settings.currency})</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 4800"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Initial Opening Stock (Units)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Low Stock Alert Min. Threshold</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={formData.minThreshold}
                      onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Store Rack Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aisle 2 - Bay B"
                    value={formData.locationRack}
                    onChange={(e) => setFormData({ ...formData, locationRack: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Save to Demo Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
