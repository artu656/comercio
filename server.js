const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000; // USA EL PUERTO QUE ASIGNE RAILWAY O LOCAL 3000

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// CONEXIÓN A MONGODB ATLAS USANDO VARIABLE DE ENTORNO
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('CONECTADO A MONGODB ATLAS'))
.catch(err => console.error('ERROR DE CONEXIÓN:', err));

// Esquema y modelo de usuario
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Ruta de registro
app.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
        await nuevoUsuario.save();
        res.status(201).send('Usuario registrado');
    } catch (err) {
        res.status(500).send('Error al registrar usuario');
    }
});

// Ruta de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(401).send('Usuario no encontrado');
        const valid = await bcrypt.compare(password, usuario.password);
        if (!valid) return res.status(401).send('Contraseña incorrecta');
        res.send('Bienvenido ' + usuario.nombre);
    } catch (err) {
        res.status(500).send('Error en el inicio de sesión');
    }
});

// Esquema y modelo de Producto
const ProductoSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    stock: Number,
    categoria: String
});
const Producto = mongoose.model('Producto', ProductoSchema);

// CRUD de Productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).send('Error al obtener productos');
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).send('Producto creado');
    } catch (error) {
        res.status(500).send('Error al crear producto');
    }
});

// 🆕 Ruta para actualizar producto
app.put('/api/productos/:id', async (req, res) => {
    try {
        await Producto.findByIdAndUpdate(req.params.id, req.body);
        res.send('Producto actualizado');
    } catch (error) {
        res.status(500).send('Error al actualizar producto');
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.send('Producto eliminado');
    } catch (error) {
        res.status(500).send('Error al eliminar producto');
    }
});


// 🟡 Esquema y modelo de Categoría
const CategoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
});
const Categoria = mongoose.model('Categoria', CategoriaSchema);

// 🔵 Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await Categoria.find();

        // También contamos cuántos productos tiene cada categoría
        const productos = await Producto.find();
        const conConteo = categorias.map(cat => {
            const total = productos.filter(p => p.categoria === cat.nombre).length;
            return {
                _id: cat._id,
                nombre: cat.nombre,
                descripcion: cat.descripcion,
                totalProductos: total
            };
        });

        res.json(conConteo);
    } catch (err) {
        res.status(500).send('Error al obtener categorías');
    }
});

// 🟢 Crear categoría
app.post('/api/categorias', async (req, res) => {
    try {
        const nuevaCategoria = new Categoria(req.body);
        await nuevaCategoria.save();
        res.status(201).send('Categoría creada');
    } catch (err) {
        res.status(500).send('Error al crear categoría');
    }
});

// 🟠 Modificar categoría
app.put('/api/categorias/:id', async (req, res) => {
    try {
        await Categoria.findByIdAndUpdate(req.params.id, req.body);
        res.send('Categoría actualizada');
    } catch (err) {
        res.status(500).send('Error al actualizar categoría');
    }
});

// 🔴 Eliminar categoría
app.delete('/api/categorias/:id', async (req, res) => {
    try {
        await Categoria.findByIdAndDelete(req.params.id);
        res.send('Categoría eliminada');
    } catch (err) {
        res.status(500).send('Error al eliminar categoría');
    }
});

// Esquema y modelo de Empleado
const EmpleadoSchema = new mongoose.Schema({
    nombre: String,
    telefono: String,
    rfc: String,
    puesto: String,
    direccion: String,
    fechaIngreso: Date,
    salario: Number
});
const Empleado = mongoose.model('Empleado', EmpleadoSchema);

// CRUD de Empleados
app.get('/api/empleados', async (req, res) => {
    try {
        const empleados = await Empleado.find();
        res.json(empleados);
    } catch (error) {
        res.status(500).send('Error al obtener empleados');
    }
});

app.post('/api/empleados', async (req, res) => {
    try {
        const nuevoEmpleado = new Empleado(req.body);
        await nuevoEmpleado.save();
        res.status(201).send('Empleado creado');
    } catch (error) {
        res.status(500).send('Error al crear empleado');
    }
});

app.put('/api/empleados/:id', async (req, res) => {
    try {
        await Empleado.findByIdAndUpdate(req.params.id, req.body);
        res.send('Empleado actualizado');
    } catch (error) {
        res.status(500).send('Error al actualizar empleado');
    }
});

app.delete('/api/empleados/:id', async (req, res) => {
    try {
        await Empleado.findByIdAndDelete(req.params.id);
        res.send('Empleado eliminado');
    } catch (error) {
        res.status(500).send('Error al eliminar empleado');
    }
});


const ProveedorSchema = new mongoose.Schema({
    nombre: String,
    telefono: String,
    email: String,
    direccion: String,
    categoria: String
});
const Proveedor = mongoose.model('Proveedor', ProveedorSchema, 'proveedores');

// 🚚 Rutas de Proveedores
app.get('/api/proveedores', async (req, res) => {
    try {
        const proveedores = await Proveedor.find();
        res.json(proveedores);
    } catch (error) {
        res.status(500).send('Error al obtener proveedores');
    }
});

app.post('/api/proveedores', async (req, res) => {
    try {
        const nuevoProveedor = new Proveedor(req.body);
        await nuevoProveedor.save();
        res.status(201).send('Proveedor creado');
    } catch (error) {
        res.status(500).send('Error al crear proveedor');
    }
});

app.put('/api/proveedores/:id', async (req, res) => {
    try {
        await Proveedor.findByIdAndUpdate(req.params.id, req.body);
        res.send('Proveedor actualizado');
    } catch (error) {
        res.status(500).send('Error al actualizar proveedor');
    }
});

app.delete('/api/proveedores/:id', async (req, res) => {
    try {
        await Proveedor.findByIdAndDelete(req.params.id);
        res.send('Proveedor eliminado');
    } catch (error) {
        res.status(500).send('Error al eliminar proveedor');
    }
});


// 👥 Esquema y Modelo de Cliente
const ClienteSchema = new mongoose.Schema({
    nombre: String,
    telefono: String,
    direccion: String,
    numeroCompras: Number,
    montoTotal: Number
});
const Cliente = mongoose.model('Cliente', ClienteSchema);

// 👥 Rutas de Clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).send('Error al obtener clientes');
    }
});

app.post('/api/clientes', async (req, res) => {
    try {
        const nuevoCliente = new Cliente(req.body);
        await nuevoCliente.save();
        res.status(201).send('Cliente creado');
    } catch (error) {
        res.status(500).send('Error al crear cliente');
    }
});

app.put('/api/clientes/:id', async (req, res) => {
    try {
        await Cliente.findByIdAndUpdate(req.params.id, req.body);
        res.send('Cliente actualizado');
    } catch (error) {
        res.status(500).send('Error al actualizar cliente');
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    try {
        await Cliente.findByIdAndDelete(req.params.id);
        res.send('Cliente eliminado');
    } catch (error) {
        res.status(500).send('Error al eliminar cliente');
    }
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto:${PORT}`);
});
