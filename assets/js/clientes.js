// Revisa que acción ejecutará el modal de acuerdo al botón cliqueado
$("#agregarDirecciones, #agregarDireccion").click( function() {
    let id = $(this).attr('id');

    if ( id == 'agregarDirecciones' ) {
        $("#tipoAccionDireccion").val('lista');
    } else if ( id == 'agregarDireccion' ) {
        $("#tipoAccionDireccion").val('guardar');
    }
});

$("button#guardarDireccion").click( function() {
    validateAddressFields();
});

// Método para validar los campos de una dirección
function validateAddressFields() {
    let val = $("#tipoAccionDireccion").val('lista');
    let canContinue = false;

    if(!$("#nombreFormCliente").val().trim() ||
    !$("#apellidoPaternoFormCliente").val().trim() ||
    ($("input[name=requiereFactura]:checked").val() == "si" && !$("#rfcFormCliente").val().trim()) ||
    !$("#correoFormCliente").val().trim() ||
    !$("#telefonoPrincipalFormCliente").val().trim() ||
    !$("#tipoServicioFormCliente").val().trim()) {
        next = false;
    }

    
}