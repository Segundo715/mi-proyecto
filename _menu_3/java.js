// Variables globales
let carrito = [];
let carritoVisible = false;

// Event listeners principales cuando el documento está listo
document.addEventListener('DOMContentLoaded', () => {
    // Primero ocultamos todos los platillos
    document.querySelectorAll('.platillos').forEach(platillos => {
        platillos.style.display = 'none';
    });

    // También ocultamos todos los detalles de platillos
    document.querySelectorAll('.platillo-detalles').forEach(detalles => {
        detalles.style.display = 'none';
    });

    // Manejo del clic en el encabezado de la sección
    document.querySelectorAll('.menu-section h2').forEach(header => {
        header.addEventListener('click', () => {
            const platillos = header.nextElementSibling;
            const menuSection = header.closest('.menu-section');
            
            // Verificar si la sección actual está abierta
            const isOpen = platillos.style.display === 'block';
            
            // Primero, cerrar todas las secciones
            document.querySelectorAll('.menu-section').forEach(section => {
                const sectionPlatillos = section.querySelector('.platillos');
                if (sectionPlatillos) {
                    sectionPlatillos.style.display = 'none';
                }
                section.querySelector('h2').classList.remove('active');
            });

            if (!isOpen) {
                // Si la sección estaba cerrada, la abrimos y ocultamos las demás secciones
                document.querySelectorAll('.menu-section').forEach(section => {
                    if (section !== menuSection) {
                        section.style.display = 'none';
                    }
                });
                platillos.style.display = 'block';
                header.classList.add('active');
                menuSection.classList.add('active');
            } else {
                // Si la sección estaba abierta, mostrar todas las secciones
                document.querySelectorAll('.menu-section').forEach(section => {
                    section.style.display = 'block';
                });
            }
        });
    });



// Modificar el event listener de los nombres de platillos
document.querySelectorAll('.platillo-nombre').forEach(nombre => {
    nombre.addEventListener('click', function() {
        const detalles = this.nextElementSibling;
        const platilloItem = this.closest('.platillo-item');

        // Cerrar otros detalles abiertos
        document.querySelectorAll('.platillo-detalles').forEach(detalle => {
            if (detalle !== detalles && detalle.style.display === 'block') {
                detalle.style.display = 'none';
                detalle.closest('.platillo-item').classList.remove('active');
                detalle.previousElementSibling.classList.remove('active');
            }
        });

        // Toggle los detalles actuales
        if (detalles.style.display === 'block') {
            detalles.style.display = 'none';
            platilloItem.classList.remove('active');
            this.classList.remove('active');
        } else {
            detalles.style.display = 'block';
            platilloItem.classList.add('active');
            this.classList.add('active');
            
            // Asegurar que los controles sean visibles
            const controles = detalles.querySelector('.controles-pedido');
            if (controles) {
                controles.style.display = 'flex';
                controles.style.visibility = 'visible';
            }
        }
    });
});
// ... rest of the code ...

    // Event listener para botones de agregar al carrito
    document.querySelectorAll('.btn-agregar').forEach(boton => {
        boton.addEventListener('click', function() {
            const platilloItem = this.closest('.platillo-item');
            const nombre = platilloItem.querySelector('.platillo-nombre').textContent;
            const precio = parseFloat(platilloItem.querySelector('.precio').textContent.replace('$', ''));
            const cantidad = parseInt(platilloItem.querySelector('.cantidad-input').value);
            
            agregarAlCarrito(nombre, precio, cantidad);
        });
    });
});
// Después de tus event listeners existentes, agrega estas funciones:

function agregarAlCarrito(nombre, precio, cantidad) {
    // Buscar si el item ya existe en el carrito
    const itemExistente = carrito.find(item => item.nombre === nombre);
    
    if (itemExistente) {
        // Si existe, actualizar cantidad
        itemExistente.cantidad += cantidad;
    } else {
        // Si no existe, agregar nuevo item
        carrito.push({
            nombre: nombre,
            precio: precio,
            cantidad: cantidad
        });
    }
    
    // Actualizar la UI del carrito
    actualizarCarritoUI();
    
    // Quitamos esta parte para que no abra automáticamente
    /* if (!carritoVisible) {
        toggleCarrito();
    } */
}

function actualizarCarritoUI() {
    const contenedorCarrito = document.getElementById('items-carrito');
    contenedorCarrito.innerHTML = '';
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        contenedorCarrito.innerHTML += `
            <div class="item-carrito">
                <div class="item-info">
                    <span>${item.nombre}</span>
                    <span>${item.cantidad}x $${item.precio}</span>
                </div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">x</button>
            </div>
        `;
    });
    
    document.getElementById('total-precio').textContent = total.toFixed(2);
    
    if (carrito.length > 0) {
        contenedorCarrito.innerHTML += `
            <button class="btn-whatsapp-nota" onclick="enviarPedidoWhatsApp()">
                <i class="fab fa-whatsapp"></i>
                Enviar pedido por WhatsApp
            </button>
        `;
    }
    
    actualizarContador();
}

function actualizarContador() {
    const contador = document.querySelector('.contador-items');
    if (contador) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contador.textContent = totalItems;
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
    
    // Si el carrito está vacío, ocultarlo
    if (carrito.length === 0) {
        toggleCarrito();
    }
}

function toggleCarrito() {
    const notaPedido = document.querySelector('.nota-pedido');
    carritoVisible = !carritoVisible;
    
    if (carritoVisible) {
        notaPedido.style.display = 'block';
        notaPedido.style.animation = 'slideIn 0.3s ease';
    } else {
        notaPedido.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notaPedido.style.display = 'none';
        }, 280);
    }
}


function enviarPedidoWhatsApp() {
    let mensaje = "¡Hola! Me gustaría hacer el siguiente pedido:\n\n";
    
    carrito.forEach(item => {
        mensaje += `${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toFixed(2)}\n`;
    });
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    mensaje += `\nTotal: $${total.toFixed(2)}`;
    
    // Asegúrate de que el número de WhatsApp esté en el formato correcto
    const numeroWhatsApp = "524171033804"; // Asegúrate de que este número sea correcto
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Abre la URL en una nueva pestaña
    window.open(url, '_blank');
}


// Modificamos también la función actualizarCarritoUI para asegurar que el botón se cree correctamente
function actualizarCarritoUI() {
    const contenedorCarrito = document.getElementById('items-carrito');
    if (!contenedorCarrito) return;

    contenedorCarrito.innerHTML = '';
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        contenedorCarrito.innerHTML += `
            <div class="item-carrito">
                <div class="item-info">
                    <span>${item.nombre}</span>
                    <span>${item.cantidad}x $${item.precio}</span>
                </div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})"></button>
            </div>
        `;
    });
    
    const totalPrecio = document.getElementById('total-precio');
    if (totalPrecio) {
        totalPrecio.textContent = total.toFixed(2);
    }
    
    // Agregamos el botón de WhatsApp solo si hay items en el carrito
    if (carrito.length > 0) {
        contenedorCarrito.innerHTML += `
            <div class="whatsapp-container">
                <button class="btn-whatsapp-nota" onclick="enviarPedidoWhatsApp()">
                    <i class="fab fa-whatsapp"></i>
                    Enviar pedido por WhatsApp
                </button>
            </div>
        `;
    }
    
    actualizarContador();
}
// Aquí van tus otras funciones (agregarAlCarrito, eliminarDelCarrito, etc.)


