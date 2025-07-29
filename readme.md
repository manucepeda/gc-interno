# 🎓 Curriculum Manager - Editor de Unidades Curriculares

Una aplicación web completa para gestionar unidades curriculares con prerequisitos complejos, **ahora con guardado directo al servidor**.

## ⭐ Novedades

- ✅ **Guardado automático directo** al archivo JSON (sin necesidad de exportar/importar)
- ✅ **Backend incluido** para modificación directa de archivos
- ✅ **Backup automático** antes de cada guardado
- ✅ **Sincronización en tiempo real** con el archivo de datos

## 🌟 Características

### 🔧 **Gestión Completa de Materias**
- Agregar nuevas unidades curriculares
- Editar materias existentes  
- Eliminar materias con confirmación
- Búsqueda rápida por código o nombre
- **Guardado automático** en el servidor

### 🔗 **Sistema de Prerequisitos Avanzado**
Maneja la estructura compleja mostrada en tu captura de pantalla:

- **"DEBE TENER TODAS" (AND)**: Todas las condiciones son obligatorias
- **"DEBE TENER ALGUNA" (OR)**: Al menos una opción debe cumplirse
- **Opciones complejas**: Dentro de OR, permite opciones que requieren múltiples aprobaciones
- **Requisitos mixtos**: Curso y/o examen por materia

### 📊 **Ejemplo Real: Electromagnetismo**
```
DEBE TENER ALGUNA:
├── Opción 1: Examen de F2
├── Opción 2: 2 aprobaciones entre:
│   ├── Curso de F1
│   └── Examen de CDIV  
└── Opción 3: Curso de MAT33
```

## 🚀 Instalación y Uso

### Método 1: Con Backend (Recomendado)

1. **Iniciar el servidor:**
   ```bash
   cd curriculamgmt
   python3 backend.py
   ```
   
2. **Abrir la aplicación:**
   ```
   http://localhost:8083
   ```

3. **¡Listo!** Los cambios se guardan automáticamente en `ucs-migrated.json`

### Método 2: Solo Frontend

1. Abre `index.html` directamente en el navegador
2. Usa "Cargar JSON" para importar datos
3. Usa "Exportar JSON" para descargar cambios

## 📋 Cómo Usar la Aplicación

### ➕ Agregar Nueva Materia

1. **Información básica:**
   - Código (ej: ElecMag, P1, CDIV)
   - Nombre completo
   - Créditos
   - Semestre
   - Período de dictado
   - ¿Solo examen?

2. **Prerequisitos:**
   - **Agregar Grupo "DEBE TENER TODAS"**: Para requisitos obligatorios
   - **Agregar Grupo "DEBE TENER ALGUNA"**: Para opciones alternativas
   - **Dentro de cada grupo**: Agregar condiciones simples o complejas

### 🔍 Buscar y Editar

1. Haz clic en "Buscar/Editar"
2. Busca por código o nombre
3. Selecciona "Editar" en la materia deseada
4. Modifica y guarda (automático)

## 🗂️ Estructura de Datos

### Formato JSON de Prerequisitos

```json
{
  "codigo": "ElecMag",
  "nombre": "Electromagnetismo", 
  "prerequisites": [
    {
      "requirement_id": "elecmag_req_1",
      "description": "Una de las siguientes opciones",
      "tipo": "OR",
      "opciones": [
        {
          "opcion_id": "option_1",
          "tipo": "SIMPLE",
          "codigo": "F2", 
          "requiere_exoneracion": true
        },
        {
          "opcion_id": "option_2",
          "tipo": "AND",
          "description": "2 aprobaciones entre:",
          "condiciones": [
            {"codigo": "F1", "requiere_curso": true},
            {"codigo": "CDIV", "requiere_exoneracion": true}
          ]
        }
      ]
    },
    {
      "requirement_id": "elecmag_req_2", 
      "description": "Todas las siguientes condiciones",
      "tipo": "AND",
      "condiciones": [
        {"codigo": "MAT33", "requiere_curso": true}
      ]
    }
  ]
}
```

## 🔧 Archivos del Sistema

- **`index.html`** - Interfaz principal
- **`curriculum-manager.js`** - Lógica de la aplicación
- **`styles.css`** - Estilos visuales
- **`backend.py`** - Servidor para guardado directo ⭐
- **`start.sh`** - Script de inicio rápido
- **`../data/ucs-migrated.json`** - Archivo de datos principal

## 🔄 Sistema de Backup

El backend crea automáticamente respaldos antes de cada guardado:
```
../data/ucs-migrated-backup-20250729_143022.json
```

## 🛡️ Validaciones

- ✅ Códigos únicos (no duplicados)
- ✅ Prerequisitos válidos (materias existentes)
- ✅ Campos obligatorios completos
- ✅ Formatos de datos correctos

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Verificar Python
python3 --version

# Instalar dependencias si es necesario
pip3 install requests
```

### Los cambios no se guardan
1. Verifica que el backend esté corriendo (puerto 8083)
2. Revisa la consola del navegador por errores
3. Verifica permisos de escritura en el directorio de datos

---

**¡Ahora puedes modificar directamente tu `ucs-migrated.json` sin necesidad de exportar/importar archivos!** 🎉
