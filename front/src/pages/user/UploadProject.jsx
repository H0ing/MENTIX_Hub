import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiImage, FiArchive, FiChevronDown } from 'react-icons/fi';
import { createProject, uploadProjectThumbnail, uploadProjectFile } from '../../api/projectApi';

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
  const [uploading, setUploading] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);

    try {
      const tagsArray = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const { data } = await createProject({
        title: form.title,
        description: form.description,
        category: form.category || null,
        tags: tagsArray,
        external_links: [],
      });

      const projectId = data.data.id;

      if (coverFile) {
        await uploadProjectThumbnail(projectId, coverFile);
      }

      if (projectFile) {
        await uploadProjectFile(projectId, projectFile);
      }

      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit project. Please try again.';
      setErrors((prev) => ({ ...prev, title: msg }));
    } finally {
      setUploading(false);
    }
  }

  function clearFileError() {
    if (errors.projectFile) {
      setErrors((prev) => ({ ...prev, projectFile: '' }));
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 h-[80vh]">
        <div className="text-[#630ed4] text-4xl">✓</div>
        <h2 className="text-2xl font-semibold text-black">Project Submitted!</h2>
        <p className="text-gray-500 text-base">Your project has been submitted for review.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-3 bg-[#630ed4] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#500088] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto py-8 px-6">
      <h1 className="text-[26px] font-semibold text-black text-center mb-6">
        Share Your Innovation
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        {/* Basic Information card */}
        <div className="bg-white border border-[#bdbdbd] rounded-xl shadow-[0px_3px_3px_rgba(0,0,0,0.20)] p-6 mb-5">
          <h2 className="text-[#630ed4] font-semibold text-[15px] mb-4">BASIC INFORMATION</h2>

          {/* Title */}
          <div className="mb-4">
            <label className="text-[#595959] text-[15px] font-normal block mb-1.5">
              Project Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Neural Network Optimization for Urban Planning"
              className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] text-[#272727] outline-none focus:border-[#630ed4] transition-colors"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category + Tags row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-[#595959] text-[15px] font-normal block mb-1.5">
                Categories
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] text-[#272727] outline-none appearance-none bg-white focus:border-[#630ed4] transition-colors cursor-pointer"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={15}
                />
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div className="flex-1">
              <label className="text-[#595959] text-[15px] font-normal block mb-1.5">
                Technical Tags
              </label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Python, TensorFlow, CAD..."
                className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] text-[#272727] outline-none focus:border-[#630ed4] transition-colors"
              />
              {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[#595959] text-[15px] font-normal block mb-1.5">
              Detail Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the problem, methodology, and result of your project..."
              rows={5}
              className="w-full border border-[#65646f] rounded-lg px-3 py-2 text-[14px] text-[#272727] outline-none resize-none focus:border-[#630ed4] transition-colors"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Upload row: Cover + Files */}
        <div className="flex gap-4 mb-5">
          {/* Project Cover */}
          <div className="flex-1 bg-white border border-[#bdbdbd] rounded-xl shadow-[0px_3px_3px_rgba(0,0,0,0.20)] p-5">
            <h2 className="text-[#630ed4] font-semibold text-[15px] mb-3">PROJECT COVER</h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#919191] rounded-xl h-[120px] cursor-pointer hover:border-[#630ed4] hover:bg-purple-50 transition-all group">
              <FiImage size={30} className="text-gray-400 group-hover:text-[#630ed4] mb-1.5 transition-colors" />
              <p className="font-semibold text-[14px] text-black">
                {coverFile ? coverFile.name : 'Upload Cover Image'}
              </p>
              <p className="text-[12px] text-gray-500">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                className="hidden"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Project Files */}
          <div className="flex-1 bg-white border border-[#bdbdbd] rounded-xl shadow-[0px_3px_3px_rgba(0,0,0,0.20)] p-5">
            <h2 className="text-[#630ed4] font-semibold text-[15px] mb-3">PROJECT FILES</h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#919191] rounded-xl h-[120px] cursor-pointer hover:border-[#630ed4] hover:bg-purple-50 transition-all group">
              <FiArchive size={30} className="text-gray-400 group-hover:text-[#630ed4] mb-1.5 transition-colors" />
              <p className="font-semibold text-[14px] text-black">
                {projectFile ? projectFile.name : 'Attach ZIP Bundle'}
              </p>
              <p className="text-[12px] text-gray-500">Source code, PDFs, Assets</p>
              <input
                type="file"
                accept=".zip,.tar.gz"
                className="hidden"
                onChange={(e) => { setProjectFile(e.target.files?.[0] || null); clearFileError(); }}
              />
            </label>
            {errors.projectFile && <p className="text-red-500 text-xs mt-1.5">{errors.projectFile}</p>}
          </div>
        </div>

        {/* Guidelines + Submit */}
        {errors.agreeToGuidelines && (
          <p className="text-red-500 text-xs mb-1.5">{errors.agreeToGuidelines}</p>
        )}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div
              onClick={() => setForm((prev) => ({ ...prev, agreeToGuidelines: !prev.agreeToGuidelines }))}
              className={`w-[28px] h-[28px] border rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                form.agreeToGuidelines
                  ? 'border-[#630ed4] bg-[#630ed4]'
                  : 'border-[#bdbdbd] bg-white'
              }`}
            >
              {form.agreeToGuidelines && (
                <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
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
            <span className="text-[15px] text-[#272727]">
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
            disabled={uploading}
            className="bg-[#630ed4] text-white px-6 py-2.5 rounded-[14px] text-[16px] font-medium hover:bg-[#500088] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
