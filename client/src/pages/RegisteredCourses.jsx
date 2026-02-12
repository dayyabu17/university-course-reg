import { useNavigate } from 'react-router-dom'
import RegisteredCoursesEmpty from '../components/RegisteredCoursesEmpty.jsx'
import RegisteredCoursesTables from '../components/RegisteredCoursesTables.jsx'
import RegistrationSummaryFooter from '../components/RegistrationSummaryFooter.jsx'
import useRegistration from '../hooks/useRegistration.js'
import useRegistrationMode from '../hooks/useRegistrationMode.js'

function RegisteredCourses() {
  const navigate = useNavigate()
  const { courses, totalUnits, loading, refresh } = useRegistration()
  const { enableUpdateMode } = useRegistrationMode()
  const hasCourses = courses.length > 0

  const handleUpdateRegistration = async () => {
    enableUpdateMode()
    await refresh()
    navigate('/dashboard')
  }

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
          ) : hasCourses ? (
            <RegisteredCoursesTables courses={courses} />
          ) : (
            <RegisteredCoursesEmpty
              onGoDashboard={() => navigate('/dashboard')}
            />
          )}

          {hasCourses ? (
            <RegistrationSummaryFooter
              totalUnits={totalUnits}
              onUpdate={handleUpdateRegistration}
            />
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default RegisteredCourses
