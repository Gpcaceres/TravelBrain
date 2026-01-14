import React from 'react';

export default function UserTable({ users, onToggleStatus, onDelete, onChangeRole, updatingUserId, deletingUserId }) {
  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nombre</th>
            <th>Username</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.name || '-'}</td>
              <td>{user.username || '-'}</td>
              <td>
                <select
                  value={user.role}
                  onChange={e => onChangeRole(user._id, e.target.value)}
                  className={`role-select role-${user.role?.toLowerCase()}`}
                >
                  <option value="USER">Usuario</option>
                  <option value="REGISTERED">Registrado</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </td>
              <td>
                <div className="toggle-switch-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={user.status === 'ACTIVE'}
                      onChange={() => onToggleStatus(user._id, user.status)}
                      disabled={updatingUserId === user._id}
                    />
                    <span className="toggle-slider">
                      {updatingUserId === user._id && <span className="toggle-spinner"></span>}
                    </span>
                  </label>
                </div>
              </td>
              <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : '-'}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(user._id)}
                    title="Quitar usuario"
                    disabled={deletingUserId === user._id}
                  >
                    {deletingUserId === user._id ? 'Eliminando...' : 'Quitar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
