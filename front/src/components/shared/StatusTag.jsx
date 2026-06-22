const map = {
  pending:      'bg-[#FEF3E2] text-[#B45309]',
  under_review: 'bg-[#F0EAFC] text-[#7C3AED]',
  resolved:     'bg-[#E9F9EF] text-[#16A34A]',
  approved:     'bg-[#E9F9EF] text-[#16A34A]',
  success:      'bg-[#E9F9EF] text-[#16A34A]',
  active:       'bg-[#E9F9EF] text-[#16A34A]',
  rejected:     'bg-[#FDEAF0] text-[#E0245E]',
  failed:       'bg-[#FDEAF0] text-[#E0245E]',
  banned:       'bg-[#FDEAF0] text-[#E0245E]',
  suspended:    'bg-[#FEF3E2] text-[#B45309]',
  super_admin:  'bg-[#F0EAFC] text-[#7C3AED]',
  moderator:    'bg-[#FEF3E2] text-[#B45309]',
  dev_admin:    'bg-[#E9F9EF] text-[#16A34A]',
};

export default function StatusTag({ status }) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const cls   = map[status.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-[11px] font-bold px-[10px] py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}
