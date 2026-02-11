import { Link, useNavigate } from 'react-router-dom'
import CoursesTable from '../components/CoursesTable.jsx'
import useRegistration from '../hooks/useRegistration.js'
import useRegistrationMode from '../hooks/useRegistrationMode.js'

function RegisteredCourses() {
  const navigate = useNavigate()
  const { courses, totalUnits, loading, refresh } = useRegistration()
  const { enableUpdateMode } = useRegistrationMode()

  return (
    <div className="page-bg min-h-screen w-full px-6 py-10 text-ink-900 md:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Registration Summary
          </p>
          <h1 className="font-display text-3xl font-semibold text-slate-900 md:text-4xl">
            Your registered courses
          </h1>
          <p className="text-sm text-slate-500">
            Review your selections or update your registration.
          </p>
        </header>

        <section className="grid gap-6 rounded-[32px] bg-white/90 p-6 shadow-soft ring-1 ring-slate-200 md:p-8">
          {loading ? (
            <div className="text-sm text-slate-500">Loading registration...</div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-start gap-3 text-sm text-slate-500">
              <p>No registered courses found yet.</p>
              <button
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                Go to dashboard
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              <CoursesTable
                title="First semester"
                courses={courses.filter((course) => course.semester === 1)}
              />
              <CoursesTable
                title="Second semester"
                courses={courses.filter((course) => course.semester === 2)}
              />
            </div>
          )}

          {courses.length > 0 ? (
            <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Total credit units
                </p>
                <p className="text-xs text-slate-500">Maximum allowed: 36</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
                  {totalUnits} units
                </span>
                <button
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
                  type="button"
                  onClick={() => {
                    const fetchAndNavigate = async () => {
                      enableUpdateMode()
                      await refresh()
                      navigate('/dashboard')
                    }

                    fetchAndNavigate()
                  }}
                >
                  Update registration
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default RegisteredCourses
