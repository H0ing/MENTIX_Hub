import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiImage, FiArchive, FiChevronDown } from 'react-icons/fi';

const CATEGORIES = [
  'Web Development',
  'AI & Machine Learning',
  'Mobile Development',
  'DevOps',
  'UI/UX Design',
  'Data Science',
  'IoT',
  'Other',
];

const INITIAL_ERRORS = {
  title: '',
  category: '',
  tags: '',
  description: '',
  projectFile: '',
  agreeToGuidelines: '',
};

export default function UploadProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    tags: '',
    description: '',
    agreeToGuidelines: false,
  });
  const [coverFile, setCoverFile] = useState(null);
  const [projectFile, setProjectFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({ ...INITIAL_ERRORS });

  function validate() {
    const newErrors = { ...INITIAL_ERRORS };
    let valid = true;

    if (!form.title.trim()) {
      newErrors.title = 'Project title is required.';
      valid = false;
    }
    if (!form.category) {
      newErrors.category = 'Please select a category.';
      valid = false;
    }
    if (!form.tags.trim()) {
      newErrors.tags = 'At least one technical tag is required.';
      valid = false;
    }
    if (!form.description.trim()) {
      newErrors.description = 'Detail description is required.';
      valid = false;
    }
    if (!projectFile) {
      newErrors.projectFile = 'Please attach your project files.';
      valid = false;
    }
    if (!form.agreeToGuidelines) {
      newErrors.agreeToGuidelines = 'You must agree to the Community Guidelines.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  }

  function clearFileError() {
    if (errors.projectFile) {
      setErrors((prev) => ({ ...prev, projectFile: '' }));
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="text-[#630ed4] text-6xl">✓</div>
        <h2 className="text-3xl font-semibold text-black">Project Submitted!</h2>
        <p className="text-gray-500 text-lg">Your project has been submitted for review.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 bg-[#630ed4] text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-[#500088] transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto py-10 px-6">
      <h1 className="text-[38px] font-semibold text-black text-center mb-8">
        Share Your Innovation
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        {/* Basic Information card */}
        <div className="bg-white border border-[#bdbdbd] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-8 mb-6">
          <h2 className="text-[#630ed4] font-semibold text-[20px] mb-6">BASIC INFORMATION</h2>

          {/* Title */}
          <div className="mb-5">
            <label className="text-[#595959] text-[20px] font-normal block mb-2">
              Project Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Neural Network Optimization for Urban Planning"
              className="w-full border border-[#65646f] rounded-xl px-4 py-3 text-[18px] text-[#272727] outline-none focus:border-[#630ed4] transition-colors"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category + Tags row */}
          <div className="flex gap-6 mb-5">
            <div className="flex-1">
              <label className="text-[#595959] text-[20px] font-normal block mb-2">
                Categories
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-[#65646f] rounded-xl px-4 py-3 text-[18px] text-[#272727] outline-none appearance-none bg-white focus:border-[#630ed4] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <FiChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={18}
                />
              </div>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div className="flex-1">
              <label className="text-[#595959] text-[20px] font-normal block mb-2">
                Technical Tags
              </label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Python, TensorFlow, CAD..."
                className="w-full border border-[#65646f] rounded-xl px-4 py-3 text-[18px] text-[#272727] outline-none focus:border-[#630ed4] transition-colors"
              />
              {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[#595959] text-[20px] font-normal block mb-2">
              Detail Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the problem, methodology, and result of your project..."
              rows={6}
              className="w-full border border-[#65646f] rounded-xl px-4 py-3 text-[18px] text-[#272727] outline-none resize-none focus:border-[#630ed4] transition-colors"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Upload row: Cover + Files */}
        <div className="flex gap-6 mb-6">
          {/* Project Cover */}
          <div className="flex-1 bg-white border border-[#bdbdbd] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6">
            <h2 className="text-[#630ed4] font-semibold text-[20px] mb-4">PROJECT COVER</h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#919191] rounded-2xl h-[145px] cursor-pointer hover:border-[#630ed4] hover:bg-purple-50 transition-all group">
              <FiImage size={40} className="text-gray-400 group-hover:text-[#630ed4] mb-2 transition-colors" />
              <p className="font-semibold text-[18px] text-black">
                {coverFile ? coverFile.name : 'Upload Cover Image'}
              </p>
              <p className="text-[14px] text-gray-500">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                className="hidden"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Project Files */}
          <div className="flex-1 bg-white border border-[#bdbdbd] rounded-xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6">
            <h2 className="text-[#630ed4] font-semibold text-[20px] mb-4">PROJECT FILES</h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#919191] rounded-2xl h-[145px] cursor-pointer hover:border-[#630ed4] hover:bg-purple-50 transition-all group">
              <FiArchive size={40} className="text-gray-400 group-hover:text-[#630ed4] mb-2 transition-colors" />
              <p className="font-semibold text-[18px] text-black">
                {projectFile ? projectFile.name : 'Attach ZIP Bundle'}
              </p>
              <p className="text-[14px] text-gray-500">Source code, PDFs, Assets</p>
              <input
                type="file"
                accept=".zip,.tar.gz"
                className="hidden"
                onChange={(e) => { setProjectFile(e.target.files?.[0] || null); clearFileError(); }}
              />
            </label>
            {errors.projectFile && <p className="text-red-500 text-sm mt-2">{errors.projectFile}</p>}
          </div>
        </div>

        {/* Guidelines + Submit */}
        {errors.agreeToGuidelines && (
          <p className="text-red-500 text-sm mb-2">{errors.agreeToGuidelines}</p>
        )}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm((prev) => ({ ...prev, agreeToGuidelines: !prev.agreeToGuidelines }))}
              className={`w-[35px] h-[34px] border rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                form.agreeToGuidelines
                  ? 'border-[#630ed4] bg-[#630ed4]'
                  : 'border-[#bdbdbd] bg-white'
              }`}
            >
              {form.agreeToGuidelines && (
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path
                    d="M1 6L5.5 10.5L15 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-[20px] text-[#272727]">
              I agree to the{' '}
              <span
                className="text-[#630ed4] font-medium cursor-pointer hover:underline"
                onClick={(e) => { e.stopPropagation(); navigate('/guidelines'); }}
              >
                Community Guidelines
              </span>
            </span>
          </label>

          <button
            type="submit"
            className="bg-[#630ed4] text-white px-8 py-3 rounded-[20px] text-[22px] font-medium hover:bg-[#500088] transition-colors"
          >
            Submit Project
          </button>
        </div>
      </form>
    </div>
  );
}