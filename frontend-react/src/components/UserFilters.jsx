import React from 'react';
import PropTypes from 'prop-types';

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
      // Helper para el label del rol
      const getRoleLabel = (role) => {
        if (role === 'ADMIN') return 'Administrador';
        if (role === 'REGISTERED') return 'Registrado';
        return 'Usuario';
      };

      return (
        <div className="user-filters">
          <input
            type="text"
            placeholder="Buscar por nombre o email"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</option>
            ))}
          </select>
          <select
            value={filters.role}
            onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">Todos los roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{getRoleLabel(role)}</option>
            ))}
          </select>
        </div>
      );
