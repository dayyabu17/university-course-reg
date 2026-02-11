import TableShell from './TableShell.jsx'

function CoursesTable({ title, courses }) {
  return (
    <TableShell
      title={title}
      countLabel={`${courses.length} course${courses.length === 1 ? '' : 's'}`}
      columns={['Course', 'Details', 'Level']}
    >
      {courses.length === 0 ? (
        <div className="px-4 py-4 text-sm text-slate-500">No courses found.</div>
      ) : (
        courses.map((course) => (
          <div
            key={course._id}
            className="grid grid-cols-[1.2fr_1fr_140px] items-center gap-4 px-4 py-4"
          >
            <div className="text-sm font-semibold text-slate-800">
              {course.courseCode} - {course.courseName}
            </div>
            <div className="text-xs text-slate-500">
              Semester {course.semester} • {course.creditUnit} units
            </div>
            <div className="text-right text-xs font-semibold text-slate-500">
              {course.level}
            </div>
          </div>
        ))
      )}
    </TableShell>
  )
}

export default CoursesTable
