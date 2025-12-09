require("dotenv").config();
const mongoose = require("mongoose");

const Facultad = require("./src/models/facultad.model");
const Materia = require("./src/models/materia.model");
const Espacio = require("./src/models/espacio.model");
const Recurso = require("./src/models/recurso.model");
const Reserva = require("./src/models/reserva.model");
const Usuario = require("./src/models/usuario.model");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Reserva.deleteMany();

    let usuarioDemo = await Usuario.findOne({ correo: "marcelo@reserved.com" });

    if (!usuarioDemo) {
     usuarioDemo = await Usuario.findOne(); 
    }

    const fIng = await Facultad.findOne({ codigo: "FING" });
    const fSal = await Facultad.findOne({ codigo: "FSAL" });
    const fArt = await Facultad.findOne({ codigo: "FART" });

    const mSO = await Materia.findOne({ codigo: "SOF101" });
    const mVideo = await Materia.findOne({ codigo: "VID201" });
    const mEDatos = await Materia.findOne({ codigo: "ETDT" });
    const mRedesAv = await Materia.findOne({ codigo: "INRE101" });
    const mRedesInal = await Materia.findOne({ codigo: "RED301" });
    const mMicro = await Materia.findOne({ codigo: "MICRO" });
    const mCircuitos = await Materia.findOne({ codigo: "CADI" });

    const mAnat = await Materia.findOne({ codigo: "ANA101" });
    const mCuidados = await Materia.findOne({ codigo: "CCE" });
    const mFarmaco = await Materia.findOne({ codigo: "FDS" });
    const mFisio = await Materia.findOne({ codigo: "FDSM" });
    const mMedInt = await Materia.findOne({ codigo: "MIDS" });
    const mPatologia = await Materia.findOne({ codigo: "PDSM" });

    const mDisenoDigital = await Materia.findOne({ codigo: "DGDD" });
    const mIlustracion = await Materia.findOne({ codigo: "IPFA" });
    const mBranding = await Materia.findOne({ codigo: "BYTF" });
    const mEscultura = await Materia.findOne({ codigo: "ESCA" });
    const mTeoriaArte = await Materia.findOne({ codigo: "TDAF" });
    const mPintura = await Materia.findOne({ codigo: "CON101" });
    const mProdMusical = await Materia.findOne({ codigo: "PMFA" });
    const mArmonia = await Materia.findOne({ codigo: "AYMA" });

    const eAudSalud = await Espacio.findOne({ nombre: "Auditorio de Conferencias Médicas" });
    const eAudIng = await Espacio.findOne({ nombre: "Auditorio de Innovación Tecnológica" });
    const eAudArt = await Espacio.findOne({ nombre: "Auditorio de Presentaciones Artísticas" });

    const eAulaSalud = await Espacio.findOne({ nombre: "Aula Teórica de Ciencias de la Salud" });
    const eAulaDiseno = await Espacio.findOne({ nombre: "Aula de Diseño Artístico" });
    const eAulaProg = await Espacio.findOne({ nombre: "Aula de Programación" });

    const eLabAnat = await Espacio.findOne({ nombre: "Laboratorio de Anatomía" });
    const eLabDiseno = await Espacio.findOne({ nombre: "Laboratorio de Diseño Digital" });
    const eLabElec = await Espacio.findOne({ nombre: "Laboratorio de Electrónica / Computación" });

    const eSalaProy = await Espacio.findOne({ nombre: "Sala de Proyectos Tecnológicos" });
    const eSalaMusica = await Espacio.findOne({ nombre: "Sala de Prácticas Musicales" });
    const eSalaSim = await Espacio.findOne({ nombre: "Sala de Simulación Clínica" });

    const rAnalizador = await Recurso.findOne({ nombre: "Analizador de Tráfico WiFi" });
    const rPCAlto = await Recurso.findOne({ nombre: "Computadoras (Alto rendimiento)" });
    const rKitsIng = await Recurso.findOne({ nombre: "Kits de Arduino y Raspberry Pi" });
    const rOculus = await Recurso.findOne({ nombre: "Oculus Quest 2" });
    const rOsciloscopio = await Recurso.findOne({ nombre: "Osciloscopio y multímetro" });
    const rProyIng = await Recurso.findOne({ nombre: "ProyectorBenQ", facultad: fIng ? fIng._id : null });

    const rCamillas = await Recurso.findOne({ nombre: "Camillas médicas" });
    const rEquipoAnat = await Recurso.findOne({ nombre: "Equipo de anatomía" });
    const rInstBasico = await Recurso.findOne({ nombre: "Instrumental básico de laboratorio" });
    const rLenovo = await Recurso.findOne({ nombre: "LENOVO" });
    const rMonitoresSV = await Recurso.findOne({ nombre: "Monitores de signos vitales" });
    const rProySalud = await Recurso.findOne({ nombre: "ProyectorBenQ", facultad: fSal ? fSal._id : null });
    const rSimPac = await Recurso.findOne({ nombre: "Simuladores de paciente" });

    const rCamaras = await Recurso.findOne({ nombre: "Cámaras profesionales" });
    const rSonido = await Recurso.findOne({ nombre: "Equipos de sonido" });
    const rInstrumentos = await Recurso.findOne({ nombre: "Instrumentos musicales" });
    const rLienzos = await Recurso.findOne({ nombre: "Lienzos, pinturas, arcilla" });
    const rTablets = await Recurso.findOne({ nombre: "Tablets gráficas" });

    const reservas = [];

    if (fIng && eAulaProg && mSO && rProyIng) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mSO._id,
        espacio: eAulaProg._id,
        recursos: [rProyIng._id],
        fechaInicio: new Date("2025-01-15T08:00:00"),
        fechaFin: new Date("2025-01-15T10:00:00"),
        estado: "CONFIRMADA",
        motivo: "Clase magistral de Sistemas Operativos."
      });
    }

    if (fIng && eSalaProy && mVideo && rOculus && rPCAlto) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mVideo._id,
        espacio: eSalaProy._id,
        recursos: [rOculus._id, rPCAlto._id],
        fechaInicio: new Date("2025-02-10T10:00:00"),
        fechaFin: new Date("2025-02-10T13:00:00"),
        estado: "CONFIRMADA",
        motivo: "Práctica de pruebas de videojuego en realidad virtual."
      });
    }

    if (fIng && eLabElec && mEDatos && rPCAlto) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mEDatos._id,
        espacio: eLabElec._id,
        recursos: [rPCAlto._id],
        fechaInicio: new Date("2025-03-05T09:00:00"),
        fechaFin: new Date("2025-03-05T12:00:00"),
        estado: "CONFIRMADA",
        motivo: "Laboratorio de implementación de estructuras de datos."
      });
    }

    if (fIng && eLabElec && mMicro && rOsciloscopio && rKitsIng) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mMicro._id,
        espacio: eLabElec._id,
        recursos: [rOsciloscopio._id, rKitsIng._id],
        fechaInicio: new Date("2025-04-18T14:00:00"),
        fechaFin: new Date("2025-04-18T17:00:00"),
        estado: "CONFIRMADA",
        motivo: "Práctica de programación de microcontroladores."
      });
    }

    if (fIng && eAudIng && mRedesAv && rAnalizador && rProyIng) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mRedesAv._id,
        espacio: eAudIng._id,
        recursos: [rAnalizador._id, rProyIng._id],
        fechaInicio: new Date("2025-05-22T08:00:00"),
        fechaFin: new Date("2025-05-22T11:00:00"),
        estado: "CONFIRMADA",
        motivo: "Seminario de administración de redes avanzadas."
      });
    }

    if (fIng && eSalaProy && mRedesInal && rAnalizador) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mRedesInal._id,
        espacio: eSalaProy._id,
        recursos: [rAnalizador._id],
        fechaInicio: new Date("2025-06-10T15:00:00"),
        fechaFin: new Date("2025-06-10T18:00:00"),
        estado: "CONFIRMADA",
        motivo: "Pruebas de cobertura de redes inalámbricas en campus."
      });
    }

    if (fIng && eLabElec && mCircuitos && rOsciloscopio) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mCircuitos._id,
        espacio: eLabElec._id,
        recursos: [rOsciloscopio._id],
        fechaInicio: new Date("2025-08-07T09:00:00"),
        fechaFin: new Date("2025-08-07T12:00:00"),
        estado: "CONFIRMADA",
        motivo: "Laboratorio de análisis de circuitos analógicos."
      });
    }

    if (fSal && eLabAnat && mAnat && rEquipoAnat && rInstBasico) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mAnat._id,
        espacio: eLabAnat._id,
        recursos: [rEquipoAnat._id, rInstBasico._id],
        fechaInicio: new Date("2025-01-20T09:00:00"),
        fechaFin: new Date("2025-01-20T12:00:00"),
        estado: "CONFIRMADA",
        motivo: "Práctica de anatomía básica con modelos anatómicos."
      });
    }

    if (fSal && eSalaSim && mCuidados && rSimPac && rCamillas && rMonitoresSV) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mCuidados._id,
        espacio: eSalaSim._id,
        recursos: [rSimPac._id, rCamillas._id, rMonitoresSV._id],
        fechaInicio: new Date("2025-03-12T14:00:00"),
        fechaFin: new Date("2025-03-12T17:00:00"),
        estado: "CONFIRMADA",
        motivo: "Simulación de atención en cuidados críticos."
      });
    }

    if (fSal && eAulaSalud && mFarmaco && rProySalud) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mFarmaco._id,
        espacio: eAulaSalud._id,
        recursos: [rProySalud._id],
        fechaInicio: new Date("2025-04-09T08:00:00"),
        fechaFin: new Date("2025-04-09T10:00:00"),
        estado: "CONFIRMADA",
        motivo: "Clase teórica de farmacología clínica."
      });
    }

    if (fSal && eLabAnat && mFisio && rInstBasico && rLenovo) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mFisio._id,
        espacio: eLabAnat._id,
        recursos: [rInstBasico._id, rLenovo._id],
        fechaInicio: new Date("2025-06-03T09:00:00"),
        fechaFin: new Date("2025-06-03T12:00:00"),
        estado: "CONFIRMADA",
        motivo: "Laboratorio de fisiología con apoyo digital."
      });
    }

    if (fSal && eAudSalud && mMedInt && rProySalud) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mMedInt._id,
        espacio: eAudSalud._id,
        recursos: [rProySalud._id],
        fechaInicio: new Date("2025-09-16T10:00:00"),
        fechaFin: new Date("2025-09-16T12:00:00"),
        estado: "CONFIRMADA",
        motivo: "Conferencia de actualización en medicina interna."
      });
    }

    if (fSal && eSalaSim && mPatologia && rSimPac && rCamillas) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mPatologia._id,
        espacio: eSalaSim._id,
        recursos: [rSimPac._id, rCamillas._id],
        fechaInicio: new Date("2025-11-05T14:00:00"),
        fechaFin: new Date("2025-11-05T17:00:00"),
        estado: "CONFIRMADA",
        motivo: "Simulación de casos clínicos de patología general."
      });
    }

    if (fArt && eAulaDiseno && mDisenoDigital && rTablets && rCamaras) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mDisenoDigital._id,
        espacio: eAulaDiseno._id,
        recursos: [rTablets._id, rCamaras._id],
        fechaInicio: new Date("2025-02-14T09:00:00"),
        fechaFin: new Date("2025-02-14T12:00:00"),
        estado: "CONFIRMADA",
        motivo: "Taller de diseño digital con captura fotográfica."
      });
    }

    if (fArt && eLabDiseno && mIlustracion && rTablets) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mIlustracion._id,
        espacio: eLabDiseno._id,
        recursos: [rTablets._id],
        fechaInicio: new Date("2025-03-21T10:00:00"),
        fechaFin: new Date("2025-03-21T13:00:00"),
        estado: "CONFIRMADA",
        motivo: "Práctica de ilustración digital avanzada."
      });
    }

    if (fArt && eAulaDiseno && mBranding && rProyIng) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mBranding._id,
        espacio: eAulaDiseno._id,
        recursos: [rProyIng ? rProyIng._id : null].filter(Boolean),
        fechaInicio: new Date("2025-04-25T08:00:00"),
        fechaFin: new Date("2025-04-25T11:00:00"),
        estado: "CONFIRMADA",
        motivo: "Presentación de proyectos de branding y tipografía."
      });
    }

    if (fArt && eSalaMusica && mProdMusical && rInstrumentos && rSonido) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mProdMusical._id,
        espacio: eSalaMusica._id,
        recursos: [rInstrumentos._id, rSonido._id],
        fechaInicio: new Date("2025-05-30T14:00:00"),
        fechaFin: new Date("2025-05-30T18:00:00"),
        estado: "CONFIRMADA",
        motivo: "Grabación de ensayos para producción musical."
      });
    }

    if (fArt && eAulaDiseno && mTeoriaArte && rLienzos) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mTeoriaArte._id,
        espacio: eAulaDiseno._id,
        recursos: [rLienzos._id],
        fechaInicio: new Date("2025-07-10T08:00:00"),
        fechaFin: new Date("2025-07-10T10:00:00"),
        estado: "CONFIRMADA",
        motivo: "Actividad práctica de análisis de técnicas pictóricas."
      });
    }

    if (fArt && eLabDiseno && mPintura && rLienzos) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mPintura._id,
        espacio: eLabDiseno._id,
        recursos: [rLienzos._id],
        fechaInicio: new Date("2025-09-03T09:00:00"),
        fechaFin: new Date("2025-09-03T12:00:00"),
        estado: "CONFIRMADA",
        motivo: "Sesión intensiva de técnicas de pintura avanzada."
      });
    }

    if (fArt && eAudArt && mEscultura && rCamaras) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mEscultura._id,
        espacio: eAudArt._id,
        recursos: [rCamaras._id],
        fechaInicio: new Date("2025-10-20T10:00:00"),
        fechaFin: new Date("2025-10-20T13:00:00"),
        estado: "CONFIRMADA",
        motivo: "Registro de exposición de escultura contemporánea."
      });
    }

    if (fArt && eSalaMusica && mArmonia && rInstrumentos) {
      reservas.push({
        usuario: usuarioDemo._id,
        materia: mArmonia._id,
        espacio: eSalaMusica._id,
        recursos: [rInstrumentos._id],
        fechaInicio: new Date("2025-11-11T15:00:00"),
        fechaFin: new Date("2025-11-11T18:00:00"),
        estado: "CONFIRMADA",
        motivo: "Ensayo de armonía y composición para recital."
      });
    }

    if (reservas.length > 0) {
      await Reserva.insertMany(reservas);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
