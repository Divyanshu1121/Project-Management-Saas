import React from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import { Database } from 'lucide-react';

/**
 * DataTable
 * columns: [{ key, label, width, align, render(value, row) }]
 * data:    array of row objects
 */
const DataTable = ({
    columns,
    data,
    loading = false,
    emptyIcon,
    emptyTitle = 'No data found',
    emptyDescription,
    emptyAction,
    onRowClick,
    skeletonRows = 5,
    rowKey = '_id',
    stickyHeader = false,
    maxHeight,
}) => {
    if (loading) {
        return (
            <div style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--surface-border)', overflow: 'hidden', background: 'white', boxShadow: 'var(--sh-sm)' }}>
                <div style={{ background: 'var(--surface-1)', padding: '0.625rem 1.25rem', borderBottom: '1px solid var(--surface-subtle)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `2fr ${Array(columns.length - 1).fill('1fr').join(' ')}`, gap: '1rem' }}>
                        {columns.map((_, i) => <Skeleton key={i} h={11} />)}
                    </div>
                </div>
                {Array.from({ length: skeletonRows }).map((_, i) => <Skeleton.Row key={i} cols={columns.length} />)}
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--r-xl)', background: 'white', boxShadow: 'var(--sh-sm)' }}>
                <EmptyState icon={emptyIcon || Database} title={emptyTitle} description={emptyDescription} action={emptyAction} />
            </div>
        );
    }

    return (
        <div style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--surface-border)', overflow: 'hidden', background: 'white', boxShadow: 'var(--sh-sm)' }}>
            <div style={{ overflowX: 'auto', maxHeight }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: stickyHeader ? 'sticky' : 'static', top: 0, zIndex: 2 }}>
                        <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--surface-border)' }}>
                            {columns.map(col => (
                                <th key={col.key} style={{ padding: '0.65rem 1.25rem', textAlign: col.align || 'left', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--clr-slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', width: col.width }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, ri) => (
                            <tr
                                key={row[rowKey] || ri}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                style={{ borderBottom: '1px solid var(--surface-subtle)', cursor: onRowClick ? 'pointer' : 'default', transition: 'background var(--t-fast)' }}
                                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'var(--surface-1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                                {columns.map(col => (
                                    <td key={col.key} style={{ padding: '0.875rem 1.25rem', fontSize: 'var(--text-base)', color: 'var(--clr-slate-700)', textAlign: col.align || 'left', verticalAlign: 'middle' }}>
                                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
