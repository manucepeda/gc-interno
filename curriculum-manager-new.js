/**
 * Curriculum Manager - Modern UI
 * Gestión de Unidades Curriculares con prerequisitos complejos
 */

class CurriculumManager {
    constructor() {
        this.subjects = [];
        this.currentEditingSubject = null;
        this.currentView = 'home';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatusInfo();
        this.loadDefaultData();
    }

    bindEvents() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Form submission
        const form = document.getElementById('subject-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        const clearSearchBtn = document.getElementById('btn-clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // File input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileLoad(e);
            });
        }

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay') || e.target.matches('.modal-close')) {
                this.closeModal();
            }
        });
    }

    // Navigation
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // Initialize view-specific content
        if (viewName === 'search') {
            this.initSearchView();
        } else if (viewName === 'add') {
            this.initAddView();
        } else if (viewName === 'manage') {
            this.initManageView();
        }
    }

    initSearchView() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
        this.showAllSubjects();
    }

    initAddView() {
        this.resetForm();
        this.currentEditingSubject = null;
        document.getElementById('form-title').textContent = 'Agregar Nueva Materia';
    }

    initManageView() {
        this.updateManageStats();
    }

    // Data management
    async loadDefaultData() {
        try {
            const response = await fetch('../data/ucs-migrated.json');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    this.subjects = data.filter(subject => subject && subject.codigo);
                    this.updateStatusInfo();
                    console.log(`Loaded ${this.subjects.length} subjects`);
                }
            }
        } catch (error) {
            console.log('Could not load default data:', error);
        }
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    this.subjects = data.filter(subject => subject && subject.codigo);
                    this.updateStatusInfo();
                    this.showModal('Éxito', `Archivo cargado correctamente. ${this.subjects.length} materias importadas.`);
                } else {
                    throw new Error('El archivo debe contener un array de materias');
                }
            } catch (error) {
                console.error('Error loading file:', error);
                this.showModal('Error', 'Error al cargar el archivo JSON. Verifica que sea un archivo válido.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    updateStatusInfo() {
        const totalElement = document.getElementById('total-subjects');
        if (totalElement) {
            totalElement.textContent = this.subjects.length;
        }
    }

    updateManageStats() {
        const statsTotal = document.getElementById('stats-total');
        const statsWithPrereq = document.getElementById('stats-with-prereq');
        
        if (statsTotal) {
            statsTotal.textContent = this.subjects.length;
        }
        
        if (statsWithPrereq) {
            const withPrereq = this.subjects.filter(s => s.prerequisites && s.prerequisites.length > 0).length;
            statsWithPrereq.textContent = withPrereq;
        }
    }

    // Form handling
    handleFormSubmit() {
        const formData = this.collectFormData();
        if (!this.validateFormData(formData)) {
            return;
        }

        const subjectData = this.buildSubjectData(formData);
        this.saveSubject(subjectData);
    }

    collectFormData() {
        return {
            codigo: document.getElementById('codigo').value.trim(),
            nombre: document.getElementById('nombre').value.trim(),
            creditos: parseInt(document.getElementById('creditos').value),
            semestre: parseInt(document.getElementById('semestre').value),
            dictation_semester: document.getElementById('dictation_semester').value,
            exam_only: document.getElementById('exam_only').checked,
            prerequisites: this.collectPrerequisites()
        };
    }

    validateFormData(data) {
        if (!data.codigo) {
            this.showModal('Error', 'El código es requerido');
            return false;
        }
        if (!data.nombre) {
            this.showModal('Error', 'El nombre es requerido');
            return false;
        }
        if (!data.creditos || data.creditos < 1) {
            this.showModal('Error', 'Los créditos deben ser un número mayor a 0');
            return false;
        }
        if (!data.semestre) {
            this.showModal('Error', 'El semestre es requerido');
            return false;
        }
        if (!data.dictation_semester) {
            this.showModal('Error', 'El semestre de dictado es requerido');
            return false;
        }

        // Check for duplicate codigo (only if not editing)
        if (!this.currentEditingSubject) {
            const existing = this.subjects.find(s => s.codigo === data.codigo);
            if (existing) {
                this.showModal('Error', `Ya existe una materia con el código "${data.codigo}"`);
                return false;
            }
        }

        return true;
    }

    buildSubjectData(formData) {
        return {
            codigo: formData.codigo,
            nombre: formData.nombre,
            creditos: formData.creditos,
            semestre: formData.semestre,
            dictation_semester: formData.dictation_semester,
            exam_only: formData.exam_only,
            prerequisites: formData.prerequisites
        };
    }

    saveSubject(subjectData) {
        try {
            if (this.currentEditingSubject) {
                // Edit existing
                const idx = this.subjects.findIndex(s => s.codigo === this.currentEditingSubject.codigo);
                if (idx !== -1) {
                    this.subjects[idx] = subjectData;
                    this.showModal('Éxito', 'Materia actualizada correctamente', () => {
                        this.switchView('search');
                    });
                }
            } else {
                // Add new
                this.subjects.push(subjectData);
                this.showModal('Éxito', 'Materia agregada correctamente', () => {
                    this.resetForm();
                });
            }
            this.updateStatusInfo();
        } catch (error) {
            console.error('Error saving subject:', error);
            this.showModal('Error', 'Ocurrió un error al guardar la materia');
        }
    }

    // Prerequisites management
    generatePrerequisiteDescription(codigo, requiereCurso, requiereExamen) {
        if (!codigo.trim()) return '';
        
        const codigoUpper = codigo.trim().toUpperCase();
        const subjectName = this.getSubjectNameByCode(codigoUpper) || codigoUpper;
        
        if (requiereCurso && requiereExamen) {
            return `Salvar curso ${subjectName} y Exonerar ${subjectName}`;
        } else if (requiereCurso) {
            return `Salvar curso ${subjectName}`;
        } else if (requiereExamen) {
            return `Exonerar ${subjectName}`;
        } else {
            return `Completar ${subjectName}`;
        }
    }

    getSubjectNameByCode(codigo) {
        const subject = this.subjects.find(s => s.codigo === codigo);
        return subject ? subject.nombre : null;
    }

    collectPrerequisites() {
        const container = document.getElementById('prerequisites-container');
        const prerequisites = [];
        
        // Simple prerequisites
        container.querySelectorAll('.prerequisite-item').forEach(prereqEl => {
            const codigo = prereqEl.querySelector('.prereq-subject').value.trim().toUpperCase();
            const description = prereqEl.querySelector('.prereq-description').value.trim();
            const requiere_curso = prereqEl.querySelector('.prereq-curso').checked;
            const requiere_exoneracion = prereqEl.querySelector('.prereq-examen').checked;
            
            if (codigo) {
                prerequisites.push({
                    requirement_id: `simple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    description: description || `Prerequisito ${codigo}`,
                    tipo: 'SIMPLE',
                    codigo: codigo,
                    requiere_curso,
                    requiere_exoneracion
                });
            }
        });
        
        // Group prerequisites
        container.querySelectorAll('.prerequisite-group').forEach(groupEl => {
            const type = groupEl.dataset.type;
            const groupDescription = groupEl.querySelector('.group-desc-input').value.trim();
            
            if (type === 'AND') {
                const condiciones = [];
                
                groupEl.querySelectorAll('.group-condition').forEach(conditionEl => {
                    const codigo = conditionEl.querySelector('.condition-codigo').value.trim().toUpperCase();
                    const description = conditionEl.querySelector('.condition-description').value.trim();
                    const requiere_curso = conditionEl.querySelector('.condition-curso').checked;
                    const requiere_exoneracion = conditionEl.querySelector('.condition-examen').checked;
                    
                    if (codigo) {
                        condiciones.push({
                            codigo: codigo,
                            description: description || `Condición ${codigo}`,
                            requiere_curso,
                            requiere_exoneracion
                        });
                    }
                });
                
                if (condiciones.length > 0) {
                    prerequisites.push({
                        requirement_id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        description: groupDescription || `Debe tener todas las condiciones`,
                        tipo: 'AND',
                        condiciones: condiciones
                    });
                }
                
            } else if (type === 'OR') {
                const opciones = [];
                
                groupEl.querySelectorAll('.group-condition').forEach(conditionEl => {
                    const codigo = conditionEl.querySelector('.condition-codigo').value.trim().toUpperCase();
                    const description = conditionEl.querySelector('.condition-description').value.trim();
                    const requiere_curso = conditionEl.querySelector('.condition-curso').checked;
                    const requiere_exoneracion = conditionEl.querySelector('.condition-examen').checked;
                    
                    if (codigo) {
                        opciones.push({
                            opcion_id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            description: description || `Opción ${codigo}`,
                            tipo: 'SIMPLE',
                            codigo: codigo,
                            requiere_curso,
                            requiere_exoneracion
                        });
                    }
                });
                
                if (opciones.length > 0) {
                    prerequisites.push({
                        requirement_id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        description: groupDescription || `Debe tener alguna de las opciones`,
                        tipo: 'OR',
                        opciones: opciones
                    });
                }
            }
        });
        
        return prerequisites;
    }

    addSimplePrerequisite() {
        const container = document.getElementById('prerequisites-container');
        this.clearEmptyState(container);
        
        const prereqElement = this.createSimplePrerequisiteElement();
        container.appendChild(prereqElement);
    }

    addAndGroup() {
        const container = document.getElementById('prerequisites-container');
        this.clearEmptyState(container);
        
        const groupElement = this.createPrerequisiteGroup('AND');
        container.appendChild(groupElement);
    }

    addOrGroup() {
        const container = document.getElementById('prerequisites-container');
        this.clearEmptyState(container);
        
        const groupElement = this.createPrerequisiteGroup('OR');
        container.appendChild(groupElement);
    }

    createSimplePrerequisiteElement() {
        const div = document.createElement('div');
        div.className = 'prerequisite-item';
        div.innerHTML = `
            <div class="prereq-card">
                <div class="prereq-header">
                    <h4><i class="fas fa-bookmark"></i> Prerequisito Simple</h4>
                    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                <div class="prereq-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Código de materia *</label>
                            <input type="text" class="prereq-subject" placeholder="Ej: P1, CDIV, F1, GAL1..." 
                                   style="text-transform: uppercase;" maxlength="10">
                            <small class="form-hint">Ingresa el código de la materia requerida</small>
                        </div>
                        <div class="form-group">
                            <label>Descripción automática</label>
                            <input type="text" class="prereq-description" placeholder="Se generará automáticamente..." readonly>
                        </div>
                    </div>
                    <div class="checkbox-row">
                        <label class="checkbox-label">
                            <input type="checkbox" class="prereq-curso" checked>
                            <span class="checkmark"></span>
                            <span class="checkbox-text">Requiere haber cursado</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" class="prereq-examen">
                            <span class="checkmark"></span>
                            <span class="checkbox-text">Requiere exoneración</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        // Set up auto-description functionality
        const codeInput = div.querySelector('.prereq-subject');
        const descInput = div.querySelector('.prereq-description');
        const cursoCheck = div.querySelector('.prereq-curso');
        const examenCheck = div.querySelector('.prereq-examen');
        
        const updateDescription = () => {
            const code = codeInput.value.trim().toUpperCase();
            if (code) {
                const desc = this.generatePrerequisiteDescription(code, cursoCheck.checked, examenCheck.checked);
                descInput.value = desc;
            } else {
                descInput.value = '';
            }
        };
        
        codeInput.addEventListener('input', updateDescription);
        cursoCheck.addEventListener('change', updateDescription);
        examenCheck.addEventListener('change', updateDescription);
        
        return div;
    }

    createPrerequisiteGroup(type) {
        const div = document.createElement('div');
        div.className = 'prerequisite-group';
        div.dataset.type = type;
        
        const groupTitle = type === 'AND' ? 'Debe tener TODAS' : 'Debe tener ALGUNA';
        const groupDescription = type === 'AND' ? 'Todas las condiciones siguientes deben cumplirse' : 'Al menos una de las siguientes condiciones debe cumplirse';
        const groupColor = type === 'AND' ? 'success' : 'warning';
        
        div.innerHTML = `
            <div class="group-card">
                <div class="group-header ${groupColor}">
                    <div class="group-title">
                        <i class="fas ${type === 'AND' ? 'fa-check-double' : 'fa-list-ul'}"></i>
                        <h4>${groupTitle}</h4>
                    </div>
                    <div class="group-actions">
                        <button type="button" class="btn btn-outline btn-sm" onclick="curriculumManager.addConditionToGroup(this.closest('.prerequisite-group'))">
                            <i class="fas fa-plus"></i> Agregar condición
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.prerequisite-group').remove()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="group-description">
                    <p>${groupDescription}</p>
                    <input type="text" class="group-desc-input" placeholder="Descripción personalizada del grupo (opcional)..." />
                </div>
                <div class="prerequisite-group-content">
                    <div class="empty-conditions">
                        <i class="fas fa-plus-circle"></i>
                        <p>No hay condiciones agregadas</p>
                        <small>Usa el botón "Agregar condición" para empezar</small>
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    addConditionToGroup(groupElement) {
        const content = groupElement.querySelector('.prerequisite-group-content');
        
        // Remove empty state if it exists
        const emptyState = content.querySelector('.empty-conditions');
        if (emptyState) {
            emptyState.remove();
        }
        
        const condition = this.createGroupConditionElement();
        content.appendChild(condition);
    }

    createGroupConditionElement() {
        const div = document.createElement('div');
        div.className = 'group-condition';
        div.innerHTML = `
            <div class="condition-card">
                <div class="form-row">
                    <div class="form-group">
                        <label>Código de materia *</label>
                        <input type="text" class="condition-codigo" placeholder="Ej: P1, CDIV, F1..." 
                               style="text-transform: uppercase;" maxlength="10">
                    </div>
                    <div class="form-group">
                        <label>Descripción automática</label>
                        <input type="text" class="condition-description" placeholder="Se generará automáticamente..." readonly>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="checkbox-row">
                    <label class="checkbox-label">
                        <input type="checkbox" class="condition-curso" checked>
                        <span class="checkmark"></span>
                        <span class="checkbox-text">Requiere curso</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" class="condition-examen">
                        <span class="checkmark"></span>
                        <span class="checkbox-text">Requiere exoneración</span>
                    </label>
                </div>
            </div>
        `;
        
        // Set up auto-description
        const codeInput = div.querySelector('.condition-codigo');
        const descInput = div.querySelector('.condition-description');
        const cursoCheck = div.querySelector('.condition-curso');
        const examenCheck = div.querySelector('.condition-examen');
        
        const updateDescription = () => {
            const code = codeInput.value.trim().toUpperCase();
            if (code) {
                const desc = this.generatePrerequisiteDescription(code, cursoCheck.checked, examenCheck.checked);
                descInput.value = desc;
            } else {
                descInput.value = '';
            }
        };
        
        codeInput.addEventListener('input', updateDescription);
        cursoCheck.addEventListener('change', updateDescription);
        examenCheck.addEventListener('change', updateDescription);
        
        return div;
    }

    clearEmptyState(container) {
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    // Search functionality
    handleSearch(query) {
        if (!query.trim()) {
            this.showAllSubjects();
            return;
        }

        const filtered = this.subjects.filter(subject => 
            subject.codigo.toLowerCase().includes(query.toLowerCase()) ||
            subject.nombre.toLowerCase().includes(query.toLowerCase())
        );

        this.displaySearchResults(filtered);
    }

    showAllSubjects() {
        this.displaySearchResults(this.subjects);
    }

    displaySearchResults(subjects) {
        const container = document.getElementById('search-results');
        
        if (!subjects || subjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron materias</p>
                    <small>Intenta con otros términos de búsqueda</small>
                </div>
            `;
            return;
        }

        container.innerHTML = subjects.map(subject => `
            <div class="search-result-item" onclick="curriculumManager.editSubject('${subject.codigo}')">
                <div class="search-result-header">
                    <span class="search-result-code">${subject.codigo}</span>
                    <span class="search-result-credits">${subject.creditos} créditos</span>
                </div>
                <div class="search-result-name">${subject.nombre}</div>
                <div class="search-result-meta">
                    <span>Semestre: ${subject.semestre}</span>
                    <span>Dictado: ${this.formatDictationSemester(subject.dictation_semester)}</span>
                    <span>${subject.exam_only ? 'Solo examen' : 'Curso + Examen'}</span>
                    <span>${subject.prerequisites?.length || 0} prerequisitos</span>
                </div>
            </div>
        `).join('');
    }

    formatDictationSemester(semester) {
        switch (semester) {
            case 'both': return 'Ambos';
            case '1': return '1er sem';
            case '2': return '2do sem';
            default: return semester;
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            this.showAllSubjects();
        }
    }

    editSubject(codigo) {
        const subject = this.subjects.find(s => s.codigo === codigo);
        if (!subject) return;

        this.currentEditingSubject = subject;
        this.populateForm(subject);
        this.switchView('add');
        
        document.getElementById('form-title').textContent = `Editar: ${subject.codigo}`;
    }

    populateForm(subject) {
        document.getElementById('codigo').value = subject.codigo;
        document.getElementById('nombre').value = subject.nombre;
        document.getElementById('creditos').value = subject.creditos;
        document.getElementById('semestre').value = subject.semestre;
        document.getElementById('dictation_semester').value = subject.dictation_semester;
        document.getElementById('exam_only').checked = subject.exam_only;
        
        // TODO: Populate prerequisites
    }

    resetForm() {
        const form = document.getElementById('subject-form');
        if (form) {
            form.reset();
        }
        
        const container = document.getElementById('prerequisites-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sitemap"></i>
                    <p>No hay prerequisitos definidos</p>
                    <small>Usa los botones de arriba para agregar prerequisitos</small>
                </div>
            `;
        }
        
        this.currentEditingSubject = null;
    }

    // Export/Import functionality
    exportData() {
        try {
            const dataStr = JSON.stringify(this.subjects, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ucs-migrated.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showModal('Éxito', 'Archivo exportado correctamente');
        } catch (error) {
            console.error('Error exporting:', error);
            this.showModal('Error', 'Error al exportar el archivo');
        }
    }

    loadJsonFile() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    // Modal functionality
    showModal(title, message, onConfirm = null) {
        const modal = document.getElementById('modal-overlay');
        const titleElement = document.getElementById('modal-title');
        const messageElement = document.getElementById('modal-message');
        const confirmButton = document.getElementById('modal-confirm');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        
        if (confirmButton) {
            confirmButton.onclick = () => {
                this.closeModal();
                if (onConfirm) onConfirm();
            };
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Global functions for HTML onclick handlers
function switchView(viewName) {
    if (window.curriculumManager) {
        window.curriculumManager.switchView(viewName);
    }
}

function loadJsonFile() {
    if (window.curriculumManager) {
        window.curriculumManager.loadJsonFile();
    }
}

function exportData() {
    if (window.curriculumManager) {
        window.curriculumManager.exportData();
    }
}

function resetForm() {
    if (window.curriculumManager) {
        window.curriculumManager.resetForm();
    }
}

function addSimplePrerequisite() {
    if (window.curriculumManager) {
        window.curriculumManager.addSimplePrerequisite();
    }
}

function addAndGroup() {
    if (window.curriculumManager) {
        window.curriculumManager.addAndGroup();
    }
}

function addOrGroup() {
    if (window.curriculumManager) {
        window.curriculumManager.addOrGroup();
    }
}

function closeModal() {
    if (window.curriculumManager) {
        window.curriculumManager.closeModal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.curriculumManager = new CurriculumManager();
});
