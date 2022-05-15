// Función para obtener los giros de negocio
function getConceptosCasos() {
    let settings = {
        url      : urlGetConceptosCasos,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        if (response.success) {
            conceptoFugasQuejasArr = response.data;
        }
        // setselectConceptosCasos((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Determina qué conceptos de mostrarán acorde al tipo de caso seleccionado (Fuga/Queja)
$('select#tipoCasoFugaQueja').on('change', function(e) {
    let tipoCaso = $('#tipoCasoFugaQueja').val();
    $('#fechaVisitaFugaQueja, #horarioPreferidoFugaQueja').parent().parent().removeClass('d-none');
    $('select#conceptoFugaQueja').children('option').remove();
    $("select#conceptoFugaQueja").append('<option value="">Seleccione una opción</option>');

    for (var i = 0; i < conceptoFugasQuejasArr.length; i++) {
        if ( tipoCaso == 1 && conceptoFugasQuejasArr[i].typeName == 'Fugas') {// Fugas
            $("select#conceptoFugaQueja").append('<option value='+conceptoFugasQuejasArr[i].id+'>'+conceptoFugasQuejasArr[i].name+'</option>');
        }
        else if ( tipoCaso == 2 && conceptoFugasQuejasArr[i].typeName == 'Quejas') {// Quejas
            $("select#conceptoFugaQueja").append('<option value='+conceptoFugasQuejasArr[i].id+'>'+conceptoFugasQuejasArr[i].name+'</option>');
        }
    }

    if ( tipoCaso == 1 ) { // Fugas
        // $('#fechaVisitaFugaQueja, #horarioPreferidoFugaQueja').parent().parent().removeClass('d-none');
    } else if ( tipoCaso == 2 ) { // Quejas
        $('#fechaVisitaFugaQueja, #horarioPreferidoFugaQueja').parent().parent().addClass('d-none');
    }
});


function setselectConceptosCasos(items) {
    $('select#conceptoFugaQueja').children('option').remove();
    $("select#conceptoFugaQueja").append('<option value="">Seleccione una opción</option>');

    if ( items.length ) {
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#conceptoFugaQueja").append(
                    '<option value='+items[key].id+'>'+items[key].name+'</option>'
                );
            }
        }
    } else {
        console.warn('No hay conceptos por cargar');
    }
}

getConceptosCasos();

// Guarda una nueva nota
$('#guardarNuevaNotaAdicional').on('click', function () {
    agregarNotas();
});

// Guarda la información de un pedido
$('#guardarFugaQueja').on('click', function () {
    let zonaPrecio  = $('#zonaPrecioCliente').data("price");
    let addressObj  = $('#direccionCliente').children(':selected').data('address');
    let tipo        = $('#tipoCasoFugaQueja').val();
    let canContinue = false;
    if(
        !$("#tipoCasoFugaQueja").val()   ||
        !$("#prioridadFugaQueja").val()  ||
        ( $("#tipoCasoFugaQueja").val() == 1 && ( !$("#conceptoFugaQueja").val() ) )
        // $('table.productosMetodoPago tbody').find("tr.metodo").length == 0
    ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if (! canContinue ) { 
        alert("Favor de llenar todos los campos con *");
        return; 
    }

    let casos = [];
    let notas = [];
    $('#notasAdicionales tbody').children('tr.notasAdicionalesItem').each(function( index ) {
        let texto = $( this ).children('td').siblings("td:nth-child(1)").text();
        notas.push(texto);
    });

    let tmp = {
        "title"         : $('#tipoCasoFugaQueja').children(':selected').text(),
        "company"       : $('#idCliente').text(),
        "subsidiary"    : userSubsidiary,
        "item"          : $('#articuloFugaQueja').val(),
        "email"         : $('#emailFugaQueja').val(),
        "category"      : $('#tipoCasoFugaQueja').val(),
        "phone"         : $('#telefonoFugaQueja').val(),
        "status"        : 1,
        "priority"      : $('#prioridadFugaQueja').val(),
        "concepto"      : $('#conceptoFugaQueja').val(),
        "priceZone"     : zonaPrecio,
        "id_oportuniti" : $('#asociarServicioFugaQueja').val(),
        "custevent_ptg_fecha_visita" : tipo == 1 ? dateFormatFromDate($('#fechaVisitaFugaQueja').val(), '5') : '',
        "custevent_ptg_horario_preferido" : tipo == 1 ? formatTime( $('#horarioPreferidoFugaQueja').val() ) : '',
        "custevent_ptg_relacionar_caso_existente" : $('#asociarCasoFugaQueja').val(),
        "custevent_ptg_direccion_para_casos" : $('#direccionCliente').children(':selected').text(),
        "label"         : addressObj.label,
        "state"         : addressObj.stateName,
        "municipio"     : addressObj.city,
        "colonia"       : addressObj.colonia,
        "cp"            : addressObj.zip,
        "nameStreet"    : addressObj.nameStreet,
        "nExterior"     : addressObj.numExterno,
        "nInterior"     : addressObj.numInterno,
        "description"   : $('#descripcionCasoFugaQueja').val()
    }

    casos.push(tmp);

    let settings = {
        url    : urlGuardarFugaQueja,
        method : 'POST',
        data   : JSON.stringify({ casos: casos }),
    }

    loadMsg('Guardando información...');

    setAjax(settings).then((response) => {
        infoMsg('success', 'El caso se ha creado de manera correcta', '', 2000);
        console.log('Pedido creado exitósamente', response);
        casos = [];
        if ( notas.length ) {// Contiene notas por dar de alta
            setTimeout( function() {
                saveNotas(notas, response.data[0], 'caso');
            }, '2000');
        }
        clearFugasQuejasForm();
    }).catch((error) => {
        infoMsg('error', 'El pedido no ha sido creado', 'Verifique que la información sea correcta');
        // Limpia los campos de cliente
        
        console.log(error);
    });
});

// Guarda las notas de un caso u opotunidad
function saveNotas(notas, idRelacionado, tipoTransaccion) {
    let notasArr = [];
    let mensaje = 'nota';
    // let mensaje = ( tipoTransaccion == 'caso' ? 'nota' : 'mensaje' );

    for ( var i = 0; i < notas.length; i++ ) {

        let notaObj = {
            "type" : mensaje,
            "transaccion" : tipoTransaccion,
            "idRelacionado" : idRelacionado,
            "titulo" : tipoTransaccion,
            "nota" : notas[i]            
        }
        notasArr.push(notaObj);

    }

    let settings = {
        url    : urlGuardarNotaMensaje,
        method : 'POST',
        data   : JSON.stringify({ informacion: notasArr }),
    }
    
    setAjax(settings).then((response) => {
        console.log(response);
        swal.close();
        $('div.modal').modal("hide");
    }).catch((error) => {
        console.log('Notas no registradas', error);
    });
}

// Se abre el modal para ver las notas adicionales
function verNotasAdicionales($this) {
    let tipoServicio = $($this).hasClass('casos') ? 'caso' : 'oportunidad';
    let pedido = $($this).closest("tr").data("item");
    
    $("#inputSegundaLlamada").parent().parent().addClass('d-none');
    $('table.table-notas tbody').children('tr').remove();
    $('#internalIdServicio').val(pedido.id_Transaccion);
    $('#internalIdServicio').data('item', pedido);
    $('[name=tipo_servicio]').val(tipoServicio);
    
    // Si es una oportunidad, tiene permiso de gestionar una segunda llamada.
    if ( tipoServicio == 'oportunidad' ) {
        $("#inputSegundaLlamada").parent().parent().removeClass('d-none');
        $("#inputSegundaLlamada").prop('checked', ( pedido.isSecondCall ? true : false ) );
        $("#inputSegundaLlamada").prop('disabled', ( pedido.isSecondCall ? true : false ) );
    }
    
    // Abre el modal
    $("#formVerNotasAdicionalesModal").modal("show");

    // Dibuja la tabla de notas del pedido
    getMsgNotes(pedido, tipoServicio);
}

// Agrega una nueva nota
function agregarNotas() {
    let canContinue = true;
    if (! $( '#nuevaNotaAdicional' ).val() ){
        canContinue = false;
    }

    if (! canContinue ){
        infoMsg('error', 'Error', 'Favor de llenar todos los campos con *');
        return;
    }
    let notas = [];
    // let pedido = $('#internalIdServicio').data('item');
    let tipoServicio = $('[name=tipo_servicio]').val();
    let idTransaccion = $('#internalIdServicio').val();
    let texto = $( '#nuevaNotaAdicional' ).val();
    
    notas.push(texto);
    loadMsg('Guardando información');
    saveNotas(notas, idTransaccion, tipoServicio);
}

// Método para limpiar la data del cliente cuando falla una búsqueda
function clearFugasQuejasForm() {
    $('#tab-fugas-quejas').find('input.form-ptg').val('');
    // $('#tab-fugas-quejas').find('select.form-ptg').val('');
    $('#tab-fugas-quejas').find('select.form-ptg').each(function( index ) {
        $( this ).val($(this).children("option:first").val());
    });

    // Campos del formulario quejas y fugas
    $('#emailFugaQueja').val(customerGlobal ? customerGlobal.email : '');
    $('#telefonoFugaQueja').val(customerGlobal ? customerGlobal.telefono : '');

    $('select#conceptoFugaQueja, #asociarServicioFugaQueja, #asociarCasoFugaQueja').children('option').remove();
    $('select#conceptoFugaQueja, #asociarServicioFugaQueja, #asociarCasoFugaQueja').append('<option value="">Seleccione una opción</option>');

    // Se quitan las notas adicionales
    $('table#notasAdicionales tbody').children('tr.notasAdicionalesItem').remove();

    // Se muestran los campos de fecha visita y horario preferido
    $('#fechaVisitaFugaQueja, #horarioPreferidoFugaQueja').parent().parent().removeClass('d-none');
}
