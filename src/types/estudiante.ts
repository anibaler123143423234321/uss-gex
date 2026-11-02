/** Tipado de cada fila del spreadsheet GEX - BD Estudiantes */
export interface EstudianteGEX {
  item: number;
  condicionEstudio: string;
  campus: string;
  escuela: string;
  seuss: string;
  codUniv: string;
  nombres: string;
  nCicCodigo: number;
  ingreso: string;
  egreso: string;
  modalidad: string;

  // Cursos oficiales del programa (0 = Pendiente, 1 = Aprobado)
  computacionI: number;
  computacionII: number;
  computacionIII: number;
  generico: number;
  especifico: number;
  taller: number;

  // Contacto y datos complementarios
  correoInstitucional: string;
  correoPersonal?: string;
  telefonoTipo?: string;
  telefono?: string;
  estado?: string;
}
