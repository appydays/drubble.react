import './css/PlayerStats.css'
const TopStatTable = ({ title, columns, rows }) => {
    const getValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    return (
        <div className="stat-card multi-row">
            <div className="stat-label">{title}</div>
            <table className="stat-table">
                <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx}>
                        {columns.map(col => (
                            <td key={col.key}>
                                {getValue(row, col.key) ?? '—'}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TopStatTable;
