import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api.js'
import levels from '../constants/levels.js'
import TableShell from '../components/TableShell.jsx'
import useRegistration from '../hooks/useRegistration.js'
import useAuthSession from '../hooks/useAuthSession.js'
import useRegistrationMode from '../hooks/useRegistrationMode.js'

function StudentDashboard() {
  const [selectedLevel, setSelectedLevel] = useState(levels[0])
  const [courses, setCourses] = useState([])
  const [rowsBySemester, setRowsBySemester] = useState({
    1: [{ id: crypto.randomUUID(), value: '' }],
    2: [{ id: crypto.randomUUID(), value: '' }],
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
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

  const totalUnits = useMemo(() => {
    const selected = Object.values(rowsBySemester)
      .flat()
      .map((row) =>
        courses.find(
          (course) =>
            course.courseCode.toLowerCase() === row.value.toLowerCase()
        )
      )
      .filter(Boolean)

    return selected.reduce((sum, course) => sum + course.creditUnit, 0)
  }, [courses, rowsBySemester])

  const hasRegistration = registeredCourses.length > 0

  const firstSemesterCount = useMemo(
    () => registeredCourses.filter((course) => course.semester === 1).length,
    [registeredCourses]
  )

  const secondSemesterCount = useMemo(
    () => registeredCourses.filter((course) => course.semester === 2).length,
    [registeredCourses]
  )

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      setStatus(null)
      try {
        const response = await api.get('/courses/all', {
          params: { level: selectedLevel },
        })
        setCourses(response.data.data || [])
        if (!isUpdateMode) {
          setRowsBySemester({
            1: [{ id: crypto.randomUUID(), value: '' }],
            2: [{ id: crypto.randomUUID(), value: '' }],
          })
        }
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
  }, [selectedLevel, isUpdateMode])

  useEffect(() => {
    const hydrateUpdateRows = async () => {
      if (!isUpdateMode) {
        return
      }

      if (!registrationSummary) {
        const nextPayload = await refreshRegistration()
        if (!nextPayload) {
          return
        }
      }

      if (!registeredCourses.length) {
        return
      }

      const grouped = registeredCourses.reduce(
        (acc, course) => {
          const semester = course.semester
          acc[semester] = acc[semester] || []
          acc[semester].push({
            id: crypto.randomUUID(),
            value: course.courseCode,
          })
          return acc
        },
        { 1: [], 2: [] }
      )

      setRowsBySemester({
        1: grouped[1].length
          ? grouped[1]
          : [{ id: crypto.randomUUID(), value: '' }],
        2: grouped[2].length
          ? grouped[2]
          : [{ id: crypto.randomUUID(), value: '' }],
      })

      const inferredLevel = registeredCourses[0]?.level
      if (inferredLevel) {
        setSelectedLevel(inferredLevel)
      }
    }

    hydrateUpdateRows()
  }, [registrationSummary, registeredCourses, refreshRegistration])

  const handleRowChange = (semester, rowId, value) => {
    setRowsBySemester((prev) => ({
      ...prev,
      [semester]: prev[semester].map((row) =>
        row.id === rowId ? { ...row, value } : row
      ),
    }))
  }

  const handleAddRow = (semester) => {
    setRowsBySemester((prev) => ({
      ...prev,
      [semester]: [...prev[semester], { id: crypto.randomUUID(), value: '' }],
    }))
  }

  const handleRemoveRow = (semester, rowId) => {
    setRowsBySemester((prev) => ({
      ...prev,
      [semester]: prev[semester].filter((row) => row.id !== rowId),
    }))
  }

  const selectedCourseIds = useMemo(() => {
    return Object.values(rowsBySemester)
      .flat()
      .map((row) =>
        courses.find(
          (course) =>
            course.courseCode.toLowerCase() === row.value.toLowerCase()
        )
      )
      .filter(Boolean)
      .map((course) => course._id)
  }, [courses, rowsBySemester])

  const handleRegister = async () => {
    if (hasRegistration && !isUpdateMode) {
      setStatus({
        type: 'error',
        message: 'You already registered. Open the summary to update.',
      })
      return
    }
    if (!user) {
      setStatus({
        type: 'error',
        message: 'Please sign in first so we can register your courses.',
      })
      return
    }
    if (!user?.id) {
      setStatus({
        type: 'error',
        message: 'Missing user info. Please sign in again.',
      })
      return
    }

    if (selectedCourseIds.length === 0) {
      setStatus({ type: 'error', message: 'Select at least one course.' })
      return
    }

    setLoading(true)
    setStatus(null)
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

        {!isUpdateMode && hasRegistration ? (
          <section className="grid gap-4 rounded-[32px] bg-white/90 p-6 shadow-soft ring-1 ring-slate-200 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  First semester
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {firstSemesterCount}
                </p>
                <p className="text-xs text-slate-500">Registered courses</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Second semester
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {secondSemesterCount}
                </p>
                <p className="text-xs text-slate-500">Registered courses</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Total units
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {registeredUnits}
                </p>
                <p className="text-xs text-slate-500">Credit units</p>
              </div>
            </div>
            <button
              className="h-full w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 md:w-auto"
              type="button"
              onClick={() => navigate('/registered')}
            >
              View your registration
            </button>
          </section>
        ) : null}

        {!hasRegistration || isUpdateMode ? (
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

            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2].map((semester) => {
                const semesterCourses = courses.filter(
                  (course) => course.semester === semester
                )
                const rows = rowsBySemester[semester]

                return (
                  <div key={semester}>
                    <TableShell
                      title={`Semester ${semester}`}
                      countLabel={`${rows.length} row${rows.length === 1 ? '' : 's'}`}
                      columns={['Course', 'Details', 'Action']}
                      footer={
                        <div className="flex items-center justify-between">
                          <button
                            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                            type="button"
                            onClick={() => handleAddRow(semester)}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-sm">
                              +
                            </span>
                            Add course row
                          </button>
                          <span className="text-xs text-slate-400">
                            Semester {semester}
                          </span>
                        </div>
                      }
                    >
                      {loading ? (
                        <div className="px-4 py-4 text-sm text-slate-500">
                          Loading courses...
                        </div>
                      ) : semesterCourses.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-slate-500">
                          No courses found.
                        </div>
                      ) : (
                        rows.map((row) => {
                          const selectedCourse = semesterCourses.find(
                            (course) =>
                              course.courseCode.toLowerCase() ===
                              row.value.toLowerCase()
                          )

                          return (
                            <div
                              key={row.id}
                              className="grid grid-cols-[1.2fr_1fr_140px] items-center gap-4 px-4 py-4"
                            >
                              <div className="flex flex-col gap-2">
                                <input
                                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-accent-400 focus:outline-none focus:ring-4 focus:ring-accent-100"
                                  list={`course-options-${semester}`}
                                  placeholder="Search by code (e.g. CSC101)"
                                  value={row.value}
                                  onChange={(event) =>
                                    handleRowChange(
                                      semester,
                                      row.id,
                                      event.target.value
                                    )
                                  }
                                />
                                <span className="text-xs text-slate-400">
                                  {selectedCourse
                                    ? selectedCourse.courseName
                                    : 'Pick a course to see details'}
                                </span>
                              </div>

                              <div className="text-xs text-slate-500">
                                {selectedCourse ? (
                                  <div className="flex flex-col gap-1">
                                    <span>Semester {selectedCourse.semester}</span>
                                    <span>{selectedCourse.creditUnit} units</span>
                                    <span>Level {selectedCourse.level}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">
                                    No course selected
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-end">
                                {rows.length > 1 ? (
                                  <button
                                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                                    type="button"
                                    onClick={() =>
                                      handleRemoveRow(semester, row.id)
                                    }
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-300">--</span>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </TableShell>

                    <datalist id={`course-options-${semester}`}>
                      {semesterCourses.map((course) => (
                        <option key={course._id} value={course.courseCode}>
                          {course.courseName}
                        </option>
                      ))}
                    </datalist>
                  </div>
                )
              })}
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
                  disabled={loading || (!isUpdateMode && hasRegistration)}
                >
                  {isUpdateMode ? 'Update registration' : 'Register courses'}
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default StudentDashboard
