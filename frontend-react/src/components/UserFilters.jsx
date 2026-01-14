import React from 'react';

export default function UserFilters({ searchInput, setSearchInput, filters, setFilters, roles, statuses }) {
  return (
    <div className="user-filters">
      <input
        type="text"
        placeholder="Buscar por email, nombre o username..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        className="search-input"
      />
      <select
        value={filters.status}
        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        className="filter-select"
      >
        <option value="">Todos los estados</option>
        {statuses.map(status => (
          <option key={status} value={status}>{status === 'ACTIVE' ? 'Activos' : 'Inactivos'}</option>
        ))}
      </select>
      <select
        value={filters.role}
        onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
        className="filter-select"
      >
        <option value="">Todos los roles</option>
        {roles.map(role => (
          <option key={role} value={role}>{role === 'ADMIN' ? 'Administrador' : role === 'REGISTERED' ? 'Registrado' : 'Usuario'}</option>
        ))}
      </select>
    </div>
  );
}
