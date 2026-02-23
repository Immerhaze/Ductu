'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DUMMY_INSTITUTION_DATA, DUMMY_UPLOAD_HISTORY } from '@/lib/dummyConfigData';

import {
  getCoursesAdminViewAction,
  saveCourseConfigAndGenerateCoursesAction,
} from './actions/courses';

export default function ConfigPage() {
  const [role, setRole] = useState('admin'); // 'admin' | 'profesor' | 'alumno'

  // Estados para simulación de admin
  const [schoolName, setSchoolName] = useState(DUMMY_INSTITUTION_DATA.schoolName);
  const [logoName] = useState(DUMMY_INSTITUTION_DATA.logoName);
  const [primaryColor, setPrimaryColor] = useState(DUMMY_INSTITUTION_DATA.primaryColor);
  const [dates, setDates] = useState(DUMMY_INSTITUTION_DATA.semesterDates);

  // Estados comunes
  const [language, setLanguage] = useState('es');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [password, setPassword] = useState('');

  /* =========================
     Cursos (SuperAdmin)
     ========================= */
  const LEVELS = useMemo(
    () => [
      { code: 'B1', label: '1° Básico' },
      { code: 'B2', label: '2° Básico' },
      { code: 'B3', label: '3° Básico' },
      { code: 'B4', label: '4° Básico' },
      { code: 'B5', label: '5° Básico' },
      { code: 'B6', label: '6° Básico' },
      { code: 'B7', label: '7° Básico' },
      { code: 'B8', label: '8° Básico' },
      { code: 'M1', label: '1° Medio' },
      { code: 'M2', label: '2° Medio' },
      { code: 'M3', label: '3° Medio' },
      { code: 'M4', label: '4° Medio' },
    ],
    []
  );

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');
  const [courses, setCourses] = useState([]);

  const [activeLevels, setActiveLevels] = useState(LEVELS.map((l) => l.code));
  const [sectionNaming, setSectionNaming] = useState('LETTERS'); // LETTERS | NUMBERS
  const [sectionCount, setSectionCount] = useState(2);
  const [nameFormat, setNameFormat] = useState('CHILE_TRADITIONAL'); // CHILE_TRADITIONAL | COMPACT | HUNDREDS

  useEffect(() => {
    if (role !== 'admin') return;

    let mounted = true;
    (async () => {
      setCoursesLoading(true);
      setCoursesError('');
      try {
        const res = await getCoursesAdminViewAction();
        if (!mounted) return;

        const cfg = res?.config;

        if (cfg) {
          setActiveLevels(cfg.activeLevels?.length ? cfg.activeLevels : LEVELS.map((l) => l.code));
          setSectionNaming(cfg.sectionNaming || 'LETTERS');
          setSectionCount(cfg.sectionCount ?? 2);
          setNameFormat(cfg.nameFormat || 'CHILE_TRADITIONAL');
        }

        setCourses(Array.isArray(res?.courses) ? res.courses : []);
      } catch (e) {
        if (!mounted) return;
        setCoursesError(e?.message || 'No se pudo cargar la configuración de cursos.');
      } finally {
        if (mounted) setCoursesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [role, LEVELS]);

  const previewExamples = useMemo(() => {
    const max = Math.min(Number(sectionCount || 1), 3);

    // Secciones para mostrar en preview (solo para TRADITIONAL/COMPACT)
    const sections =
      sectionNaming === 'NUMBERS'
        ? Array.from({ length: max }, (_, i) => String(i + 1))
        : ['A', 'B', 'C'].slice(0, max);

    const basic = sections.map((s) => {
      if (nameFormat === 'CHILE_TRADITIONAL') return `1°${s}`;
      if (nameFormat === 'COMPACT') return `1${s}`;
      // HUNDREDS no aplica a básica; mostramos un ejemplo estable
      return `1${s}`;
    });

    const middle = (() => {
      if (nameFormat === 'CHILE_TRADITIONAL') return sections.map((s) => `1° Medio ${s}`);
      if (nameFormat === 'COMPACT') return sections.map((s) => `1M${s}`);
      // HUNDREDS: fijo y determinístico (no configurable)
      // 1° Medio: 101, 102, 103...
      return Array.from({ length: max }, (_, i) => String(101 + i));
    })();

    return { basic, middle };
  }, [sectionNaming, sectionCount, nameFormat]);

  const handleSaveAndGenerate = async () => {
    setCoursesLoading(true);
    setCoursesError('');
    try {
      await saveCourseConfigAndGenerateCoursesAction({
        activeLevels,
        sectionNaming,
        sectionCount,
        nameFormat,
      });

      const view = await getCoursesAdminViewAction();
      setCourses(Array.isArray(view?.courses) ? view.courses : []);
    } catch (e) {
      setCoursesError(e?.message || 'No se pudo guardar/generar cursos.');
    } finally {
      setCoursesLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-sm">
        <Label>Selecciona tipo de usuario</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="profesor">Profesor</SelectItem>
            <SelectItem value="alumno">Estudiante / Apoderado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {role === 'admin' && (
        <Tabs defaultValue="institution">
          <TabsList>
            <TabsTrigger value="institution">Institución</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="dates">Fechas clave</TabsTrigger>
            <TabsTrigger value="uploads">Cargas</TabsTrigger>
          </TabsList>

          <TabsContent value="institution">
            <Card>
              <CardHeader>
                <CardTitle>Información institucional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Nombre del colegio</Label>
                <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                <Label>Logo institucional</Label>
                <Input type="file" />
                {logoName && <p className="text-sm text-muted-foreground">{logoName}</p>}
                <Button>Guardar cambios</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de cursos</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {coursesError && <p className="text-sm text-red-600">{coursesError}</p>}

                <p className="text-sm text-muted-foreground">
                  Define la estructura y el sistema generará automáticamente los cursos. Para evitar errores,
                  no se crean cursos manualmente.
                </p>

                <div className="space-y-3">
                  <Label>Niveles activos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {LEVELS.map((l) => {
                      const checked = activeLevels.includes(l.code);
                      return (
                        <label key={l.code} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setActiveLevels((prev) => {
                                if (e.target.checked) return Array.from(new Set([...prev, l.code]));
                                return prev.filter((x) => x !== l.code);
                              });
                            }}
                          />
                          {l.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Paralelos</Label>
                    <Select value={sectionNaming} onValueChange={setSectionNaming}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LETTERS">Letras (A, B, C)</SelectItem>
                        <SelectItem value="NUMBERS">Números (1, 2, 3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cantidad de paralelos</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={sectionCount}
                      onChange={(e) => setSectionCount(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Formato</Label>
                    <Select value={nameFormat} onValueChange={setNameFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHILE_TRADITIONAL">Chile tradicional (7°A / 1° Medio B)</SelectItem>
                        <SelectItem value="COMPACT">Compacto (7A / 1MB)</SelectItem>
                        <SelectItem value="HUNDREDS">Hundreds (101/201/301/401 para Media)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Básica:</span> {previewExamples.basic.join(', ')}
                    </p>
                    <p>
                      <span className="font-medium">Media:</span> {previewExamples.middle.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button disabled={coursesLoading} onClick={handleSaveAndGenerate}>
                    {coursesLoading ? 'Guardando...' : 'Guardar y generar cursos'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Cursos actuales</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-muted-foreground">
                            No hay cursos generados todavía.
                          </TableCell>
                        </TableRow>
                      ) : (
                        courses.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className={!c.isActive ? 'text-muted-foreground line-through' : ''}>
                              {c.name}
                            </TableCell>
                            <TableCell>{c.isActive ? 'Activo' : 'Inactivo'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  <p className="text-sm text-muted-foreground">
                    Puedes desactivar cursos para ocultarlos sin perder históricos (estudiantes, publicaciones, etc.).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Colores y branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Color primario</Label>
                <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                <Button>Guardar branding</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dates">
            <Card>
              <CardHeader>
                <CardTitle>Fechas académicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Inicio de semestre</Label>
                <Input
                  type="date"
                  value={dates.startSemester}
                  onChange={(e) => setDates({ ...dates, startSemester: e.target.value })}
                />
                <Label>Fin de semestre</Label>
                <Input
                  type="date"
                  value={dates.endSemester}
                  onChange={(e) => setDates({ ...dates, endSemester: e.target.value })}
                />
                <Label>Periodo de evaluaciones</Label>
                <Input
                  type="date"
                  value={dates.evaluationPeriod}
                  onChange={(e) => setDates({ ...dates, evaluationPeriod: e.target.value })}
                />
                <Button>Guardar fechas</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploads">
            <Card>
              <CardHeader>
                <CardTitle>Historial de cargas masivas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Responsable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DUMMY_UPLOAD_HISTORY.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell>{upload.id}</TableCell>
                        <TableCell>{upload.type}</TableCell>
                        <TableCell>{upload.date}</TableCell>
                        <TableCell>{upload.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {(role === 'profesor' || role === 'alumno') && (
        <div className="grid gap-6 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Cambiar contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
              />
              <Button>Guardar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias generales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">Inglés</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="notificaciones"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
                <Label htmlFor="notificaciones">Recibir notificaciones por correo</Label>
              </div>

              <Button>Guardar preferencias</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Términos de uso</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                disabled
                className="text-sm text-muted-foreground"
                value="Al usar este sistema, aceptas los términos de uso de la plataforma educativa. Toda la información está protegida y su uso indebido puede ser sancionado."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
