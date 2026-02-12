import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LevelSelectorPanel from '../components/LevelSelectorPanel.jsx'
import RegistrationOverviewPanel from '../components/RegistrationOverviewPanel.jsx'
import RegistrationTotalsFooter from '../components/RegistrationTotalsFooter.jsx'
import SemesterCourseTable from '../components/SemesterCourseTable.jsx'
import useCourseCatalog from '../hooks/useCourseCatalog.js'
import useRegistration from '../hooks/useRegistration.js'
import useAuthSession from '../hooks/useAuthSession.js'
import useRegistrationMode from '../hooks/useRegistrationMode.js'
import useRegistrationRows from '../hooks/useRegistrationRows.js'

function StudentDashboard() {
  const [registerStatus, setRegisterStatus] = useState(null)
  const [registerLoading, setRegisterLoading] = useState(false)
  const navigate = useNavigate()
  const {
    payload: registrationSummary,
    courses: registeredCourses,
    totalUnits: registeredUnits,
    refresh: refreshRegistration,
    setFromPayload,
  } = useRegistration()
  const { user } = useAuthSession()
  const { isUpdateMode, clearMode } = useRegistrationMode()

  const {
    selectedLevel,
    setSelectedLevel,
    courses,
    loading: coursesLoading,
    status: coursesStatus,
  } = useCourseCatalog()

  const {
    rowsBySemester,
    totalUnits,
    selectedCourseIds,
    handleRowChange,
    handleAddRow,
    handleRemoveRow,
  } = useRegistrationRows({
    courses,
    isUpdateMode,
    registrationSummary,
    registeredCourses,
    refreshRegistration,
    onInferLevel: setSelectedLevel,
  })

  const hasRegistration = registeredCourses.length > 0

  const firstSemesterCount = useMemo(
    () => registeredCourses.filter((course) => course.semester === 1).length,
    [registeredCourses]
  )

  const secondSemesterCount = useMemo(
    () => registeredCourses.filter((course) => course.semester === 2).length,
    [registeredCourses]
  )

  const combinedStatus = registerStatus || coursesStatus

  const handleRegister = async () => {
    if (hasRegistration && !isUpdateMode) {
      setRegisterStatus({
        type: 'error',
        message: 'You already registered. Open the summary to update.',
      })
      return
    }
    if (!user) {
      setRegisterStatus({
        type: 'error',
        message: 'Please sign in first so we can register your courses.',
      })
      return
    }
    if (!user?.id) {
      setRegisterStatus({
        type: 'error',
        message: 'Missing user info. Please sign in again.',
      })
      return
    }

    if (selectedCourseIds.length === 0) {
      setRegisterStatus({
        type: 'error',
        message: 'Select at least one course.',
      })
      return
    }

    setRegisterLoading(true)
    setRegisterStatus(null)
    try {
      const response = await api.post('/courses/register', {
        courseIds: selectedCourseIds,
        userId: user.id,
      })
      setFromPayload({
        courses: response.data.user?.registeredCourses || [],
        totalUnits: response.data.totalCreditUnits,
        registeredAt: new Date().toISOString(),
      })
      clearMode()
      navigate('/registered')
    } catch (error) {
      setRegisterStatus({
        type: 'error',
        message:
          error.response?.data?.message || 'Course registration failed.',
      })
    } finally {
      setRegisterLoading(false)
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

        {!isUpdateMode && hasRegistration ? (
          <RegistrationOverviewPanel
            firstSemesterCount={firstSemesterCount}
            secondSemesterCount={secondSemesterCount}
            registeredUnits={registeredUnits}
            onViewRegistration={() => navigate('/registered')}
          />
        ) : null}

        {!hasRegistration || isUpdateMode ? (
          <section className="grid gap-6 rounded-[32px] bg-white/90 p-6 shadow-soft ring-1 ring-slate-200 md:p-8">
            <LevelSelectorPanel
              selectedLevel={selectedLevel}
              onLevelChange={(event) => setSelectedLevel(event.target.value)}
              status={combinedStatus}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2].map((semester) => (
                <SemesterCourseTable
                  key={semester}
                  semester={semester}
                  courses={courses}
                  rows={rowsBySemester[semester]}
                  loading={coursesLoading}
                  onAddRow={handleAddRow}
                  onRemoveRow={handleRemoveRow}
                  onRowChange={handleRowChange}
                />
              ))}
            </div>
            <RegistrationTotalsFooter
              totalUnits={totalUnits}
              loading={registerLoading}
              hasRegistration={hasRegistration}
              isUpdateMode={isUpdateMode}
              onRegister={handleRegister}
            />
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default StudentDashboard
