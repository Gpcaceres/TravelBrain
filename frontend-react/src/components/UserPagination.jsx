import React from 'react';
import PropTypes from 'prop-types';

export default function UserPagination({ pagination, currentPage, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!pagination.hasPrevPage}
      >
        &laquo; Anterior
      </button>
      <span className="pagination-info">
        Página {currentPage} de {pagination.totalPages}
      </span>
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!pagination.hasNextPage}
      >
        Siguiente &raquo;
      </button>
    </div>
  );
}
 
UserPagination.propTypes = {
  pagination: PropTypes.object.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
