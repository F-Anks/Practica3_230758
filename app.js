import express from "express"
import session from "express-session"
import moment from "moment-timezone"

const app = express()

//configuración del middleware de sesiones
app.use(
    session({
        secret: 'P3FGG#AXOLOT-SesionesPersistentes', //clave de cifrado de la cookie
        resave: false, //permite deshabilitar cambios hasta que haya
        saveUninitialized: true, //sino esta inicializada la crea
        cookie:{maxAge: 24 * 60 * 60 * 100} //duración que mantiene la sesi+on se utilizan los milisegundos, por eso se multiplica, esto da igual a un día
    })
)

app.get('/iniciar-sesion', (req,res)=>{
    if(!req.session.inicio){ // al igual la ultima palabra es el nombre de la variable, este if esta determinando si la sesión no existe
        req.session.inicio = new Date(); //fecha de inicio de sesión
        req.session.ultimoAcceso = new Date(); //fecha de ultima consula inicial
        res.send('Sesión iniciada')
    }else{
        res.send('La sesión ya está activa')
    }
})

app.get('/actualizar', (req,res)=>{ // evalua que ya exista sino manda el mensaje de error 
    if(req.session.inicio){ 
        req.session.ultimoAcceso = new Date(); //fecha de ultima consula inicial
        res.send('Fecha de última consulta actualizada')
    }else{
        res.send('No hay una sesión activa')
    }
})

app.get('/estado-sesion', (req,res)=>{ 
    if(req.session.inicio){ 
        const inicio = new Date(req.session.inicio)
        const ultimoAcceso = new Date(req.session.ultimoAcceso)
        const ahora = new Date()

        //calcular la antigüedad de la cuenta
        const antiguedadMs = ahora- inicio;
        const horas = Math.floor(antiguedadMs / (1000*60*60))
        const minutos = Math.floor((antiguedadMs % (1000*60*60))/(1000*60))
        const segundos = Math.floor((antiguedadMs % (1000* 60))/1000)

        //Convirtiendo la fecha a uso horario de CDMX
        const inicioCDMX = moment(inicio).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss')
        const ultimoAccesoCDMX = moment(ultimoAcceso).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss')

        res.json({
            mensaje: `Estado de la sesión`,
            sesionID: req.session,
            inicio: inicioCDMX,
            ultimoAcceso: ultimoAccesoCDMX,
            antiguedad: `${horas} horas, ${minutos} minutos, ${segundos} segundos`
        })
    }else{
        res.send('No hay una sesión activa')
    }
})

app.get('/cerrar-sesion', (req,res) => {
    if(req.session){
        req.session.destroy((err => {
            if(err) {
                return res.status(500).send('Error al cerrar sesion.')
            }
            res.send('Sesion cerrada correctamente.')
        }))
    } else {
        res.send('No hay una sesion activa para cerrar.')
    }
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Servidor levantado ejecutandose en hhtp://localhost:${PORT}`)
})