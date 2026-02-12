import { useState } from 'react'
import AddCourseForm from '../components/AddCourseForm.jsx'
import CourseCatalogControls from '../components/CourseCatalogControls.jsx'
import CoursesTable from '../components/CoursesTable.jsx'
import { CATALOG_LEVEL_FILTER_ALL } from '../constants/catalog.js'
import useAdminCoursesList from '../hooks/useAdminCoursesList.js'
import useCatalogFilters from '../hooks/useCatalogFilters.js'
import useCreateCourse from '../hooks/useCreateCourse.js'

function AdminCourses() {
  const {
    courses,
    loading: listLoading,
    status: listStatus,
    setCourses,
  } = useAdminCoursesList()
  const { createCourse, loading: createLoading, status: createStatus } =
    useCreateCourse({
      onCreated: (course) => setCourses((prev) => [course, ...prev]),
    })
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState(CATALOG_LEVEL_FILTER_ALL)
  const [page, setPage] = useState(1)

  const { filteredCourses, pagedCourses, totalPages, currentPage } =
    useCatalogFilters({ courses, query, levelFilter, page })

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
    setPage(1)
  }

  const handleFilterChange = (event) => {
    setLevelFilter(event.target.value)
    setPage(1)
  }

  const handleCreateCourse = async (payload) => {
    return createCourse(payload)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Courses
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 md:text-4xl">
          Course catalog
        </h1>
        <p className="text-sm text-slate-500">
          Manage the courses students can register for.
        </p>
      </header>

      <section className="grid gap-6 rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-soft md:grid-cols-[1.2fr_1fr]">
        <AddCourseForm
          status={createStatus}
          loading={createLoading}
          onSubmit={handleCreateCourse}
        />

        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Course tips
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>Use unique course codes (e.g., CSC 201).</li>
            <li>Match the level to the student year.</li>
            <li>Credit units can be 2 or 3.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6">
        {listStatus ? (
          <div
            className={`rounded-2xl px-4 py-3 text-xs ${
              listStatus.type === 'error'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {listStatus.message}
          </div>
        ) : null}

        <CourseCatalogControls
          query={query}
          levelFilter={levelFilter}
          onQueryChange={handleQueryChange}
          onLevelChange={handleFilterChange}
          currentCount={pagedCourses.length}
          totalCount={filteredCourses.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={() =>
            setPage((prev) => Math.min(prev + 1, totalPages))
          }
        />

        {listLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 text-sm text-slate-500 shadow-soft">
            Loading courses...
          </div>
        ) : (
          <CoursesTable title="All courses" courses={pagedCourses} />
        )}
      </section>
    </div>
  )
}

export default AdminCourses
