// src/components/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChartComponent } from './BarChartComponent';
import { LineChartComponent } from './LineChartComponent';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
    ALL_SUBJECTS,
    DUMMY_TEACHERS,
    getTeacherKpiData, // New import
    getTeacherIndividualSubjectPerformance, // New import
    getTeacherStudentsAtRisk, // New import
    getChiefTeacherKpiData, // New import
    getChiefCourseSubjectOverallAverages, // New import
    getChiefCourseStudentOverallPerformance, // New import
    getChiefCourseStudentsAtRisk, // New import
} from '@/lib/DummyPerformanceOverallData';


// --- DUMMY TEACHER ID FOR TESTING UI ---
// IMPORTANT: Change this ID to see different views.
// Use an ID from your console logs that isChiefTeacher: false for regular view.
// Use an ID from your console logs that isChiefTeacher: true for chief view.
const DUMMY_TEACHER_ID_FOR_TESTING = 'T100'; // Example: A non-chief teacher (verify from your console output)
// const DUMMY_TEACHER_ID_FOR_TESTING = 'T102'; // Example: A chief teacher (verify from your console output)


const TeacherPerformanceDashboard = () => {
    const teacherInfo = DUMMY_TEACHERS.find(t => t.id === DUMMY_TEACHER_ID_FOR_TESTING);

    if (!teacherInfo) {
        return <div className="p-4 text-center text-red-500">Error: No se encontró la información del profesor con ID {DUMMY_TEACHER_ID_FOR_TESTING}. Verifique el ID en console.log de dummyPerformanceData.js</div>;
    }

    // --- State for Teacher's Own Subject/Courses (Left Panel) ---
    // Ensure `teacherInfo.coursesAssigned` is initialized, as it's used for selectors
    const [teacherCoursesAssigned, setTeacherCoursesAssigned] = useState(teacherInfo.coursesAssigned || []);
    const [selectedTeacherCourse, setSelectedTeacherCourse] = useState(teacherInfo.coursesAssigned[0] || '');
    const [teacherKpis, setTeacherKpis] = useState({
        coursesTaught: 0,
        totalStudentsTaught: 0,
        passingStudentsOwnSubject: 0,
        failingStudentsOwnSubject: 0,
    });
    const [teacherStudentPerformanceData, setTeacherStudentPerformanceData] = useState([]);
    const [teacherStudentsAtRisk, setTeacherStudentsAtRisk] = useState([]);
    const [filterTeacherAtRiskCourse, setFilterTeacherAtRiskCourse] = useState('all');

    // --- State for Chief Teacher's Courses (Right Panel - if isChiefTeacher) ---
    // Ensure `teacherInfo.chiefTeacherOfGrades` is initialized
    const [chiefTeacherCoursesLed, setChiefTeacherCoursesLed] = useState(teacherInfo.chiefTeacherOfGrades || []);
    const [selectedChiefCourseForCharts, setSelectedChiefCourseForCharts] = useState(teacherInfo.chiefTeacherOfGrades[0] || '');
    const [selectedChiefCourseForStudentList, setSelectedChiefCourseForStudentList] = useState(teacherInfo.chiefTeacherOfGrades[0] || '');
    const [chiefTeacherKpis, setChiefTeacherKpis] = useState({
        totalStudentsInChiefCourses: 0,
        coursesLed: 0,
        passingStudentsChiefCourses: 0,
        failingStudentsChiefCourses: 0,
    });
    const [chiefCourseSubjectOverallAverages, setChiefCourseSubjectOverallAverages] = useState([]);
    const [chiefCourseStudentOverallPerformance, setChiefCourseStudentOverallPerformance] = useState([]);
    const [chiefCourseStudentsAtRisk, setChiefCourseStudentsAtRisk] = useState([]);


    useEffect(() => {
        // --- TEACHER'S OWN DATA (LEFT PANEL) ---
        if (teacherInfo) {
            // Set courses assigned and initial selection if not already set
            if (teacherCoursesAssigned.length === 0 && teacherInfo.coursesAssigned.length > 0) {
                setTeacherCoursesAssigned(teacherInfo.coursesAssigned);
                setSelectedTeacherCourse(teacherInfo.coursesAssigned[0]);
            }

            // KPI Data
            const kpiData = getTeacherKpiData(teacherInfo.id);
            if (kpiData) setTeacherKpis(kpiData);

            // Line Chart: Individual Student Performance in Teacher's Subject(s)
            if (selectedTeacherCourse) {
                setTeacherStudentPerformanceData(getTeacherIndividualSubjectPerformance(teacherInfo.id, selectedTeacherCourse));
            }

            // Student List: Students at Risk (Teacher's Subject)
            setTeacherStudentsAtRisk(getTeacherStudentsAtRisk(teacherInfo.id, filterTeacherAtRiskCourse));
        }

        // --- CHIEF TEACHER'S DATA (RIGHT PANEL) ---
        if (teacherInfo.isChiefTeacher) {
            // Set chief courses led and initial selections if not already set
            if (chiefTeacherCoursesLed.length === 0 && teacherInfo.chiefTeacherOfGrades.length > 0) {
                setChiefTeacherCoursesLed(teacherInfo.chiefTeacherOfGrades);
                setSelectedChiefCourseForCharts(teacherInfo.chiefTeacherOfGrades[0]);
                setSelectedChiefCourseForStudentList(teacherInfo.chiefTeacherOfGrades[0]);
            }

            // KPI Data
            const chiefKpiData = getChiefTeacherKpiData(teacherInfo.id);
            if (chiefKpiData) setChiefTeacherKpis(chiefKpiData);

            // Bar Chart: Overall Subject Averages for a Chief Course
            if (selectedChiefCourseForCharts) {
                setChiefCourseSubjectOverallAverages(getChiefCourseSubjectOverallAverages(teacherInfo.id, selectedChiefCourseForCharts));
            }

            // Line Chart: Individual Student Overall Performance in a Chief Course
            if (selectedChiefCourseForCharts) { // Using same selector as the bar chart for simplicity
                setChiefCourseStudentOverallPerformance(getChiefCourseStudentOverallPerformance(teacherInfo.id, selectedChiefCourseForCharts));
            }

            // Student List: Students at Risk (Chief Course)
            if (selectedChiefCourseForStudentList) {
                setChiefCourseStudentsAtRisk(getChiefCourseStudentsAtRisk(teacherInfo.id, selectedChiefCourseForStudentList));
            }
        }

    }, [
        teacherInfo,
        selectedTeacherCourse,
        filterTeacherAtRiskCourse,
        selectedChiefCourseForCharts,
        selectedChiefCourseForStudentList
    ]);

    // ... (rest of the component JSX remains the same) ...
    // The commonContent and chiefTeacherContent JSX blocks are identical to previous response.
    // Just ensure the imports and useEffect are updated as above.

    const commonContent = (
        <>
            <h2 className="text-xl font-semibold mb-4">Mi Rendimiento Académico como Docente</h2>

            {/* Teacher's Own Subject/Courses KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Impartidos</CardTitle>
                        <span className="text-2xl text-gray-500">📚</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teacherKpis.coursesTaught}</div>
                        <p className="text-xs text-muted-foreground">Cantidad de cursos donde imparte {teacherInfo.teachingSubjects.map(s => ALL_SUBJECTS.find(sub => sub.id === s)?.name).join(', ')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumnos Impartidos</CardTitle>
                        <span className="text-2xl text-gray-500">👥</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teacherKpis.totalStudentsTaught}</div>
                        <p className="text-xs text-muted-foreground">Alumnos a los que imparte su materia</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumnos Aprobados (Materia)</CardTitle>
                        <span className="text-2xl text-green-500">✅</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teacherKpis.passingStudentsOwnSubject}</div>
                        <p className="text-xs text-muted-foreground">Alumnos que aprueban su asignatura</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumnos Reprobados (Materia)</CardTitle>
                        <span className="text-2xl text-red-500">❌</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teacherKpis.failingStudentsOwnSubject}</div>
                        <p className="text-xs text-muted-foreground">Alumnos que reprueban su asignatura</p>
                    </CardContent>
                </Card>
            </div>

            {/* Line Chart: Individual Student Performance in Teacher's Subject(s) */}
            <Card className="p-4 mb-6">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-lg">Rendimiento Individual de Alumnos ({teacherInfo.teachingSubjects.map(s => ALL_SUBJECTS.find(sub => sub.id === s)?.name).join(', ')})</CardTitle>
                    <Select value={selectedTeacherCourse} onValueChange={setSelectedTeacherCourse}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Curso" />
                        </SelectTrigger>
                        <SelectContent>
                            {teacherCoursesAssigned.map(course => (
                                <SelectItem key={course} value={course}>
                                    {course}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <LineChartComponent
                        data={teacherStudentPerformanceData}
                        xAxisDataKey="name"
                        lineDataKey="grade" // Grade for the teacher's specific subject
                        title={`Promedio de Alumnos en ${selectedTeacherCourse} (${teacherInfo.teachingSubjects.map(s => ALL_SUBJECTS.find(sub => sub.id === s)?.name).join(', ')})`}
                        description="Muestra el promedio individual de los alumnos en su materia en el curso seleccionado."
                        stroke="#8884d8"
                    />
                </CardContent>
            </Card>

            {/* Student List: Students at Risk (Teacher's Subject) */}
            <Card className="p-4">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-lg">Alumnos en Riesgo (Mi Asignatura)</CardTitle>
                    <Select value={filterTeacherAtRiskCourse} onValueChange={setFilterTeacherAtRiskCourse}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por Curso" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Cursos</SelectItem>
                            {teacherCoursesAssigned.map(course => (
                                <SelectItem key={course} value={course}>
                                    {course}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>Lista de alumnos con bajo rendimiento en su asignatura.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Promedio ({teacherInfo.teachingSubjects.map(s => ALL_SUBJECTS.find(sub => sub.id === s)?.name).join(', ')})</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teacherStudentsAtRisk.length > 0 ? (
                                teacherStudentsAtRisk.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.course}</TableCell>
                                        <TableCell className="text-red-600 font-semibold">{student.grade}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">No hay alumnos en riesgo en esta asignatura.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );

    const chiefTeacherContent = teacherInfo.isChiefTeacher && (
        <>
            <h2 className="text-xl font-semibold mb-4 mt-6">Rendimiento de Cursos Liderados</h2>

            {/* Chief Teacher's Courses KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumnos Cursos Jefe</CardTitle>
                        <span className="text-2xl text-gray-500">🧑‍🤝‍🧑</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chiefTeacherKpis.totalStudentsInChiefCourses}</div>
                        <p className="text-xs text-muted-foreground">Alumnos en los cursos que lidera</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Liderados</CardTitle>
                        <span className="text-2xl text-gray-500">🌟</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chiefTeacherKpis.coursesLed}</div>
                        <p className="text-xs text-muted-foreground">Cantidad de cursos de los cuales es profesor jefe</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumnos Aprobados (General)</CardTitle>
                        <span className="text-2xl text-green-500">👍</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chiefTeacherKpis.passingStudentsChiefCourses}</div>
                        <p className="text-xs text-muted-foreground">Alumnos que aprueban en sus cursos jefe</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alumnos Reprobados (General)</CardTitle>
                        <span className="text-2xl text-red-500">👎</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{chiefTeacherKpis.failingStudentsChiefCourses}</div>
                        <p className="text-xs text-muted-foreground">Alumnos que reprueban en sus cursos jefe</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bar Chart: Overall Subject Averages for a Chief Course */}
            <Card className="p-4 mb-6">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-lg">Promedio General por Materia (Curso Jefe)</CardTitle>
                    <Select value={selectedChiefCourseForCharts} onValueChange={setSelectedChiefCourseForCharts}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Curso Jefe" />
                        </SelectTrigger>
                        <SelectContent>
                            {chiefTeacherCoursesLed.map(course => (
                                <SelectItem key={course} value={course}>
                                    {course}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <BarChartComponent
                        data={chiefCourseSubjectOverallAverages}
                        xAxisDataKey="name" // Subject Name
                        barDataKey="avgGrade" // Average grade for that subject in the selected chief course
                        title={`Promedio General de ${selectedChiefCourseForCharts || 'Curso Jefe'} por Asignatura`}
                        description="Muestra el promedio general de todas las asignaturas en un curso liderado."
                        fill="#facc15" // Tailwind yellow-400
                    />
                </CardContent>
            </Card>

            {/* Line Chart: Individual Student Overall Performance in a Chief Course */}
            <Card className="p-4 mb-6">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-lg">Rendimiento General Individual (Curso Jefe)</CardTitle>
                    <Select value={selectedChiefCourseForCharts} onValueChange={setSelectedChiefCourseForCharts}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Curso Jefe" />
                        </SelectTrigger>
                        <SelectContent>
                            {chiefTeacherCoursesLed.map(course => (
                                <SelectItem key={course} value={course}>
                                    {course}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <LineChartComponent
                        data={chiefCourseStudentOverallPerformance}
                        xAxisDataKey="name" // Student Name
                        lineDataKey="overallAvgGrade" // Overall average grade for the student
                        title={`Promedio General de Alumnos en ${selectedChiefCourseForCharts || 'Curso Jefe'}`}
                        description="Muestra el promedio general de cada alumno en el curso jefe seleccionado."
                        stroke="#a855f7" // Tailwind purple-500
                    />
                </CardContent>
            </Card>

            {/* Student List: Students at Risk (Chief Course) */}
            <Card className="p-4">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-lg">Alumnos en Riesgo (Curso Jefe)</CardTitle>
                    <Select value={selectedChiefCourseForStudentList} onValueChange={setSelectedChiefCourseForStudentList}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por Curso Jefe" />
                        </SelectTrigger>
                        <SelectContent>
                            {chiefTeacherCoursesLed.map(course => (
                                <SelectItem key={course} value={course}>
                                    {course}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>Lista de alumnos con bajo rendimiento en el curso jefe seleccionado.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Promedio General</TableHead>
                                <TableHead>Materias en Riesgo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {chiefCourseStudentsAtRisk.length > 0 ? (
                                chiefCourseStudentsAtRisk.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell className="text-red-600 font-semibold">{student.overallAvgGrade}</TableCell>
                                        <TableCell>{Array.isArray(student.atRiskSubjects) ? student.atRiskSubjects.map(s => ALL_SUBJECTS.find(sub => sub.id === s)?.name).join(', ') : student.atRiskSubjects}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">No hay alumnos en riesgo en este curso.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );


    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Panel del Docente - {teacherInfo.name}</h1>

            <div className={`grid ${teacherInfo.isChiefTeacher ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {/* Left Panel (Common to all teachers) */}
                <div className="space-y-6">
                    {commonContent}
                </div>

                {/* Right Panel (Only for Chief Teachers) */}
                {teacherInfo.isChiefTeacher && (
                    <div className="space-y-6">
                        {chiefTeacherContent}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherPerformanceDashboard;