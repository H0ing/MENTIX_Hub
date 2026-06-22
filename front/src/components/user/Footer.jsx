import { useNavigate } from 'react-router';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#ebebeb] px-12 py-8">
      <div className="flex items-start justify-between">
        {/* Left: brand + copyright */}
        <div>
          <p className="font-semibold text-[30px] text-black leading-normal">MENTIX-Hub</p>
          <p className="text-black text-[18px] mt-1">
            @ 2024 MENTIX-Hub. Modern Academic collaboration
          </p>
        </div>

        {/* Right: links */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => navigate('/guidelines')}
            className="text-[#630ed4] font-semibold text-[18px] hover:underline cursor-pointer"
          >
            Community Guidelines
          </button>
        </div>
      </div>
    </footer>
  );
}