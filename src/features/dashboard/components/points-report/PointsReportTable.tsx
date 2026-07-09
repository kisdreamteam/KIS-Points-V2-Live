'use client';

import type { PointsReportRow } from '@/hooks/usePointsReport';

export type PointsReportTableProps = {
  rows: PointsReportRow[];
  isLoading: boolean;
  pointsColumnLabel: string;
};

export default function PointsReportTable({
  rows,
  isLoading,
  pointsColumnLabel,
}: PointsReportTableProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-brand-cream/95 backdrop-blur-sm">
          <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
            <th className="px-4 py-3 w-16">#</th>
            <th className="px-4 py-3">First Name</th>
            <th className="px-4 py-3">Last Name</th>
            <th className="px-4 py-3 w-24">Gender</th>
            <th className="px-4 py-3 w-28 text-right">{pointsColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                Loading points...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No students in this class
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.studentId}
                className="border-b border-gray-100 hover:bg-white/60 transition-colors"
              >
                <td className="px-4 py-2.5 text-gray-700 tabular-nums">
                  {row.studentNumber ?? '—'}
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-900">{row.firstName}</td>
                <td className="px-4 py-2.5 font-medium text-gray-900">{row.lastName}</td>
                <td className="px-4 py-2.5 text-gray-600">{row.gender ?? ''}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-brand-purple tabular-nums">
                  {row.points}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
