// Configuración de Notion (DEBES CAMBIAR ESTOS VALORES)
        const NOTION_CONFIG = {
            // Reemplaza con tu Integration Token de Notion
            token: 'YOUR_NOTION_INTEGRATION_TOKEN',
            // Reemplaza con el ID de tu database de Notion
            databaseId: 'YOUR_DATABASE_ID'
        };

        // Estado de la aplicación
        let isSubmitting = false;

        // Elementos del DOM
        const form = document.getElementById('registration-form');
        const submitBtn = document.getElementById('submit-btn');
        const formSection = document.getElementById('form-section');
        const successSection = document.getElementById('success-section');
        const newRegisterBtn = document.getElementById('new-register-btn');

        // Inicializar la aplicación
        function init() {
            setupEventListeners();
            setupDateValidation();
        }

        // Configurar fecha máxima (18 años atrás)
        function setupDateValidation() {
            const today = new Date();
            const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            document.getElementById('fecha').max = maxDate.toISOString().split('T')[0];
        }

        // Configurar event listeners
        function setupEventListeners() {
            form.addEventListener('submit', handleSubmit);
            newRegisterBtn.addEventListener('click', resetForm);

            // Validación en tiempo real
            ['nombre', 'whatsapp', 'fecha', 'terminos'].forEach(campo => {
                const input = document.getElementById(campo);
                if (campo === 'terminos') {
                    input.addEventListener('change', () => validateField(campo));
                } else {
                    input.addEventListener('input', () => validateField(campo));
                    input.addEventListener('blur', () => validateField(campo));
                }
            });

            // Event listeners para los modales
            document.getElementById('terminos-link').addEventListener('click', (e) => {
                e.preventDefault();
                mostrarModal('modal-terminos');
            });

            document.getElementById('privacidad-link').addEventListener('click', (e) => {
                e.preventDefault();
                mostrarModal('modal-privacidad');
            });

            // Cerrar modales al hacer clic fuera
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            });

            // Establecer fechas de actualización
            const fechaActual = new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            document.getElementById('fecha-actualizacion').textContent = fechaActual;
            document.getElementById('fecha-actualizacion-privacidad').textContent = fechaActual;
        }

        // Validar campo individual
        function validateField(campo) {
            const input = document.getElementById(campo);
            const value = input.value.trim();
            const grupo = document.getElementById(`${campo}-group`);
            const errorElement = document.getElementById(`${campo}-error`);
            const successElement = document.getElementById(`${campo}-success`);
            
            let isValid = true;
            let errorMessage = '';

            // Limpiar estados previos
            grupo.classList.remove('error');
            errorElement.classList.add('hidden');
            successElement.classList.add('hidden');

            switch (campo) {
                case 'nombre':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'El nombre es obligatorio';
                    } else if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'El nombre debe tener al menos 2 caracteres';
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'El nombre solo puede contener letras y espacios';
                    }
                    break;

                case 'whatsapp':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'El número de WhatsApp es obligatorio';
                    } else {
                        const cleanNumber = value.replace(/\D/g, '');
                        if (cleanNumber.length !== 10) {
                            isValid = false;
                            errorMessage = 'Ingresa un número válido de 10 dígitos';
                        }
                    }
                    break;

                case 'fecha':
                    if (!value) {
                        isValid = false;
                        errorMessage = 'La fecha de nacimiento es obligatoria';
                    } else {
                        const birthDate = new Date(value);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        
                        if (age < 18) {
                            isValid = false;
                            errorMessage = 'Debes ser mayor de 18 años';
                        } else if (age > 100) {
                            isValid = false;
                            errorMessage = 'Ingresa una fecha válida';
                        }
                    }
                    break;

                case 'terminos':
                    if (!input.checked) {
                        isValid = false;
                        errorMessage = 'Debes aceptar los términos y condiciones';
                    }
                    break;
            }

            if (!isValid) {
                grupo.classList.add('error');
                errorElement.querySelector('span').textContent = errorMessage;
                errorElement.classList.remove('hidden');
            } else if (value || (campo === 'terminos' && input.checked)) {
                successElement.classList.remove('hidden');
            }

            return isValid;
        }

        // Validar formulario completo
        function validateForm() {
            const campos = ['nombre', 'whatsapp', 'fecha', 'terminos'];
            let isValid = true;

            campos.forEach(campo => {
                if (!validateField(campo)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        // Manejar envío del formulario
        async function handleSubmit(e) {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            if (!validateForm()) {
                showNotification('Por favor corrige los errores antes de continuar', 'error');
                return;
            }

            isSubmitting = true;
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);
                const data = {
                    nombre: formData.get('nombre').trim(),
                    whatsapp: formData.get('whatsapp').trim(),
                    fecha: formData.get('fecha'),
                    terminosAceptados: formData.get('terminos') === 'on'
                };

                await enviarANotion(data);
                mostrarExito();
                
            } catch (error) {
                console.error('Error:', error);
                showNotification('Hubo un error al guardar los datos. Intenta nuevamente.', 'error');
            } finally {
                isSubmitting = false;
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }

        // Enviar datos a Notion
        async function enviarANotion(data) {
            // Validar configuración
            if (NOTION_CONFIG.token === 'YOUR_NOTION_INTEGRATION_TOKEN' || 
                NOTION_CONFIG.databaseId === 'YOUR_DATABASE_ID') {
                throw new Error('Debes configurar tu token e ID de base de datos de Notion');
            }

            const response = await fetch('https://api.notion.com/v1/pages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${NOTION_CONFIG.token}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify({
                    parent: {
                        database_id: NOTION_CONFIG.databaseId
                    },
                    properties: {
                        // Asegúrate de que estos nombres coincidan con las columnas de tu database de Notion
                        'Nombre': {
                            title: [
                                {
                                    text: {
                                        content: data.nombre
                                    }
                                }
                            ]
                        },
                        'WhatsApp': {
                            phone_number: data.whatsapp
                        },
                        'Fecha de Nacimiento': {
                            date: {
                                start: data.fecha
                            }
                        },
                        'Fecha de Registro': {
                            date: {
                                start: new Date().toISOString().split('T')[0]
                            }
                        },
                        'Términos Aceptados': {
                            checkbox: data.terminosAceptados
                        }
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Error de Notion:', error);
                throw new Error(`Error de Notion: ${error.message || 'Error desconocido'}`);
            }

            return response.json();
        }

        // Mostrar éxito
        function mostrarExito() {
            formSection.classList.add('hidden');
            successSection.classList.remove('hidden');
            successSection.classList.add('fade-in');
        }

        // Reset formulario
        function resetForm() {
            form.reset();
            formSection.classList.remove('hidden');
            successSection.classList.add('hidden');
            
            // Limpiar validaciones
            ['nombre', 'whatsapp', 'fecha', 'terminos'].forEach(campo => {
                const grupo = document.getElementById(`${campo}-group`);
                const errorElement = document.getElementById(`${campo}-error`);
                const successElement = document.getElementById(`${campo}-success`);
                
                grupo.classList.remove('error');
                errorElement.classList.add('hidden');
                successElement.classList.add('hidden');
            });
        }

        // Mostrar notificación
        function showNotification(message, type = 'info') {
            // Crear notificación temporal
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                font-weight: bold;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                max-width: 300px;
            `;
            
            if (type === 'error') {
                notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            } else {
                notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 4000);
        }

        // CSS para animaciones de notificación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Inicializar cuando se carga la página
        document.addEventListener('DOMContentLoaded', init);



            // Funciones para manejar modales
        function mostrarModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function cerrarModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
            document.body.style.overflow = 'auto';
        }