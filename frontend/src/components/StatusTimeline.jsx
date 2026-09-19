import StatusBadge from "./StatusBadge";

const StatusTimeline = ({ history = [] }) => {
  if (!history.length) return <p className="text-sm text-gray-500">No status updates yet.</p>;

  return (
    <ol className="relative border-l border-gray-200 ml-2">
      {history.map((entry, idx) => (
        <li key={idx} className="mb-6 ml-4 last:mb-0">
          <div className="absolute w-2.5 h-2.5 bg-brand-500 rounded-full -left-[5px] border border-white" />
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <StatusBadge status={entry.status} />
            <span className="text-xs text-gray-400">
              {new Date(entry.updatedAt).toLocaleString()}
            </span>
          </div>
          {entry.remark && <p className="text-sm text-gray-600">{entry.remark}</p>}
          {entry.updatedBy?.name && (
            <p className="text-xs text-gray-400">by {entry.updatedBy.name} ({entry.updatedBy.role})</p>
          )}
        </li>
      ))}
    </ol>
  );
};

export default StatusTimeline;
