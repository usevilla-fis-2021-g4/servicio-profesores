const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
    identificacion: String,
    nombre: String,
    password: String,
    editable: Boolean
});

profesorSchema.methods.limpiar = function(){
    //return this;
    return {_id: this._id, identificacion: this.identificacion, nombre: this.nombre, editable: this.editable};
}

const Profesor = mongoose.model('Profesor', profesorSchema);

module.exports = Profesor;