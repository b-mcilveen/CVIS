

export const BaseLiteral = ({ value, type, valueClass = '' } : {
    value: string | number | boolean,
    type: string,
    valueClass?: string
}) => (
    <div className="inline-flex items-center gap-0.5 bg-gray-200 rounded-lg px-1.5 py-0.5 text-black text-sm">
        <span className={`${valueClass}`}>{value}</span>
        <span className="text-xs text-gray-600 ml-1">{type}</span>
    </div>
);