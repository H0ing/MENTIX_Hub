import { useNavigate } from 'react-router';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#ebebeb] px-8 py-6">
      <div className="flex items-start justify-between">
        {/* Left: brand + copyright */}
        <div>
          <p className="font-semibold text-[22px] text-black leading-normal">MENTIX-Hub</p>
          <p className="text-black text-[14px] mt-1">
            @ 2024 MENTIX-Hub. Modern Academic collaboration
          </p>
        </div>

        {/* Right: links */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/guidelines')}
            className="text-[#630ed4] font-semibold text-[14px] hover:underline cursor-pointer"
          >
            Community Guidelines
          </button>
        </div>
      </div>
    </footer>
  );
}