import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api.js'
import levels from '../constants/levels.js'

function StudentDashboard() {
  const [selectedLevel, setSelectedLevel] = useState(levels[0])
  const [courses, setCourses] = useState([])
  const [selectedCourses, setSelectedCourses] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const totalUnits = useMemo(() => {
    return courses
      .filter((course) => selectedCourses.includes(course._id))
      .reduce((sum, course) => sum + course.creditUnit, 0)
  }, [courses, selectedCourses])

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      setStatus(null)
      try {
        const response = await api.get('/courses/all', {
          params: { level: selectedLevel },
        })
        setCourses(response.data.data || [])
        setSelectedCourses([])
      } catch (error) {
        setStatus({
          type: 'error',
          message:
            error.response?.data?.message || 'Failed to fetch courses for level.',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedLevel])

  const handleCourseToggle = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleRegister = async () => {
    const auth = sessionStorage.getItem('auth')
    if (!auth) {
      setStatus({
        type: 'error',
        message: 'Please sign in first so we can register your courses.',
      })
      return
    }

    const { user } = JSON.parse(auth)
    if (!user?.id) {
      setStatus({
        type: 'error',
        message: 'Missing user info. Please sign in again.',
      })
      return
    }

    if (selectedCourses.length === 0) {
      setStatus({ type: 'error', message: 'Select at least one course.' })
      return
    }

    setLoading(true)
    setStatus(null)
    try {
      const response = await api.post('/courses/register', {
        courseIds: selectedCourses,
        userId: user.id,
      })
      sessionStorage.setItem(
        'registeredCourses',
        JSON.stringify({
          courses: response.data.user?.registeredCourses || [],
          totalUnits: response.data.totalCreditUnits,
          registeredAt: new Date().toISOString(),
        })
      )
      navigate('/registered')
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.response?.data?.message || 'Course registration failed.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-bg min-h-screen w-full px-6 py-10 text-ink-900 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Student Dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold text-slate-900 md:text-4xl">
            Course Registration
          </h1>
          <p className="text-sm text-slate-500">
            Select your level, review courses, and submit your registration.
          </p>
        </header>

        <section className="grid gap-6 rounded-[32px] bg-white/90 p-6 shadow-soft ring-1 ring-slate-200 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Level</p>
              <p className="text-xs text-slate-500">
                Courses update automatically when you change level.
              </p>
            </div>
            <select
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-100 md:w-56"
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level} Level
                </option>
              ))}
            </select>
          </div>

          {status ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <p className="text-sm text-slate-500">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-slate-500">No courses found.</p>
            ) : (
              courses.map((course) => (
                <label
                  key={course._id}
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {course.courseCode} - {course.courseName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Semester {course.semester} • {course.creditUnit} units
                    </p>
                  </div>
                  <input
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-accent-500 focus:ring-accent-200"
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => handleCourseToggle(course._id)}
                  />
                </label>
              ))
            )}
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Total credit units
              </p>
              <p className="text-xs text-slate-500">Maximum allowed: 36</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
                {totalUnits} units
              </span>
              <button
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={handleRegister}
                disabled={loading}
              >
                Register courses
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StudentDashboard
