import { useState } from 'react'
import FieldInput from './FieldInput.jsx'
import PrimaryButton from './PrimaryButton.jsx'

function EditCourseModal({ course, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [formData, setFormData] = useState({
    courseCode: course.courseCode || '',
    courseName: course.courseName || '',
    semester: course.semester || 1,
    creditUnit: course.creditUnit || 2,
    level: course.level || '100',
    capacity: course.capacity || 50,
    prerequisites: course.prerequisites?.join(', ') || ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const payload = {
        ...formData,
        semester: Number(formData.semester),
        creditUnit: Number(formData.creditUnit),
        capacity: Number(formData.capacity),
        prerequisites: formData.prerequisites
          ? formData.prerequisites.split(',').map(p => p.trim()).filter(Boolean)
          : []
      }

      await onUpdate(course._id, payload)
      setStatus({ type: 'success', message: 'Course updated successfully' })
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update course'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Edit Course</h2>
          <button
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            type="button"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FieldInput
              label="Course Code"
              placeholder="e.g. CSC101"
              name="courseCode"
              type="text"
              value={formData.courseCode}
              onChange={handleChange}
              required
            />
            <FieldInput
              label="Course Title"
              placeholder="e.g. Introduction to Computer Science"
              name="courseName"
              type="text"
              value={formData.courseName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-100"
                required
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Credit Unit
              </label>
              <select
                name="creditUnit"
                value={formData.creditUnit}
                onChange={handleChange}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-100"
                required
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-100"
                required
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>

          <FieldInput
            label="Capacity"
            placeholder="e.g. 50"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            required
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Prerequisites (comma-separated course codes)
            </label>
            <input
              name="prerequisites"
              type="text"
              value={formData.prerequisites}
              onChange={handleChange}
              placeholder="e.g. CSC101, CSC102"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-100"
            />
          </div>

          {status && (
            <div
              className={`rounded-2xl p-4 text-sm ${
                status.type === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <PrimaryButton type="submit" loading={loading} className="flex-1">
              Update Course
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCourseModal
