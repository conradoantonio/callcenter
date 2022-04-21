// Valida una dirección a guardar
$("button#guardarDireccion").click( function() {
    validateAddressFields();
});

// Valida la frecuencia de un pedido tipo aviso o programado
$("#frecuenciaFormCliente").on('change', function(e) {
    let val = $(this).val();
    $('.dias-semana').prop('disabled', false);
    // $('.dias-semana').prop('checked', false);
    $('.frecuencia-cada, .frecuencia-semana').addClass('d-none');

    if ( val == '1' ) { // Es un pedido diario, deben marcarse todos los días y ocultar el campo "cada"
        $('.dias-semana').prop('disabled', true);
        $('.dias-semana').prop('checked', true);
    } else if ( val == '2' ) { // Semanal, se muestra el campo "cada" y permite seleccionar cualquiera de los días
        $('.frecuencia-cada').removeClass('d-none');
    } else if ( val == '3' ) { // Semanal, se muestra el campo "cada" y permite seleccionar cualquiera de los días, además de seleccionar la semana del mes para el envío
        $('.frecuencia-cada, .frecuencia-semana').removeClass('d-none');
    }
});



// Método para validar los campos de una dirección
function validateAddressFields() {
    let tipoAccion = $("#tipoAccionDireccion").val();
    let canContinue = true;
    let numAddress = $('table.table-address tbody').children('tr.address').length;

    if(
        !$("#estadoDireccion").val().trim()    ||
        !$("#municipioDireccion").val().trim() ||
        !$("#coloniaDireccion").val().trim()   ||
        !$("#cpDireccion").val().trim()        ||
        !$("#calleDireccion").val().trim()     ||
        !$("#exteriorDireccion").val().trim()  ||
        !$("#zonaVentaDireccion").val().trim() ||
        !$("#rutaDireccion").val().trim()      ||
        !$("#tipoServicioFormCliente").val().trim() ||
        ( $("#tipoServicioFormCliente").val() == 1 && ( !$("#articuloFrecuenteCilFormCliente").val() || !$("#inputCapacidadCilTipoServicio").val() ) ) ||
        ( $("#tipoServicioFormCliente").val() == 2 && ( !$("#articuloFrecuenteEstFormCliente").val() || !$("#inputCapacidadEstTipoServicio").val().trim() ) ) ||
        ( $("#tipoServicioFormCliente").val() == 4 && ( !$("#articuloFrecuenteCilFormCliente").val() || !$("#inputCapacidadCilTipoServicio").val() || !$("#articuloFrecuenteEstFormCliente").val() || !$("#inputCapacidadEstTipoServicio").val().trim() ) ) ||
        // Dependiendo del tipo de acción, se validará los campos requeridos
        ( $("input[name=tipoAccionFormCliente]:checked").val() != "1" && 
            ( 
                $("#frecuenciaFormCliente").val() == '1' && ( !$('#fechaInicioServicio').val() ) || // Día
                $("#frecuenciaFormCliente").val() == '2' && ( !$('#fechaInicioServicio').val() || !$('#cadaFormCliente').val() ||$('input.dias-semana:checked').length == 0 ) || // Semana
                $("#frecuenciaFormCliente").val() == '3' && ( !$('#fechaInicioServicio').val() || !$('#cadaFormCliente').val() ||$('input.dias-semana:checked').length == 0 || !$('#numeroSemana').val() ) // Mes
            ) 
        ) ||
        ( $("input[name=tipoAccionFormCliente]:checked").val() != "1" && ( !$("#entreFormCliente").val() || !$("#lasFormCliente").val() ) )
    ) {
        canContinue = false;
    }

    if(! canContinue ) {
        alert("Favor de llenar todos los campos con *");
        return;
    }

    // Devuelve un objeto formateado con la información de la dirección a guardar en netsuite
    let address = getAddressOnList();

    // Enlista las direcciones en  una tabla dinámica
    if ( tipoAccion == 'lista' ) {
        // Si es la primera dirección que se agrega, se limpia el texto por defecto de la tabla
        if (! numAddress ) {
            $('table.table-address tbody').children('tr').remove();
        }

        $('table.table-address tbody').append(
            '<tr class="address" data-address='+"'"+JSON.stringify(address.obj)+"'"+'>'+
                '<td>'+address.str+'</td>'+
                '<td class="text-center">'+
                    '<div class="text-center" style="font-size: 20px;">'+
                        (address.obj.principal ? '<i class="fa-solid fa-square-check color-primary check-entrega" style="cursor: pointer;"></i>' : '<i class="fa-regular fa-square color-primary check-entrega" style="cursor: pointer;"></i>')+
                    '</div>'+
                '</td>'+
                '<td class="text-center">'+
                    '<button class="btn btn-sm btn-info edit-address"> <i class="fa fa-pen-to-square"></i> </button>&nbsp;&nbsp;'+
                    '<button class="btn btn-sm btn-danger delete-address"> <i class="fa-solid fa-trash-can"></i> </button>'+
                '</td>'+
            '</tr>'
        )

        $('div#formDireccionesModal').modal('hide');
    } else if( tipoAccion == 'guardar' ) {// Envía una dirección a guardar o actualizar
        let idAddress = $('#internalIdDireccion').val();
        let dataToSend = null;

        if ( idAddress ) {// Se actualiza la dirección
            let updateAddress = {}

            address.obj['domFacturacion'] ? updateAddress['defaultbilling'] = address.obj['domFacturacion'] : '';
            address.obj['stateName'] ? updateAddress['custrecord_ptg_estado'] = address.obj['stateName'] : '';
            address.obj['ruta'] ? updateAddress['custrecord_ptg_colonia_ruta'] = address.obj['ruta'] : '';
            address.obj['idRoute'] ? updateAddress['custrecord_ptg_ruta_asignada'] = address.obj['idRoute'] : '';
            address.obj['idRoute2'] ? updateAddress['custrecord_ptg_ruta_asignada2'] = address.obj['idRoute2'] : '';
            address.obj['colonia'] ? updateAddress['custrecord_ptg_nombre_colonia'] = address.obj['colonia'] : '';
            address.obj['lunes'] ? updateAddress['custrecord_ptg_lunes'] = address.obj['lunes'] : '';
            address.obj['stateName'] ? updateAddress['custrecord_ptg_estado'] = address.obj['stateName'] : '';
            address.obj['ruta'] ? updateAddress['custrecord_ptg_colonia_ruta'] = address.obj['ruta'] : '';
            address.obj['idRoute'] ? updateAddress['custrecord_ptg_ruta_asignada'] = address.obj['idRoute'] : '';
            address.obj['idRoute2'] ? updateAddress['custrecord_ptg_ruta_asignada2'] = address.obj['idRoute2'] : '';
            address.obj['colonia'] ? updateAddress['custrecord_ptg_nombre_colonia'] = address.obj['colonia'] : '';
            address.obj.hasOwnProperty( 'lunes' ) ? updateAddress['custrecord_ptg_lunes'] = address.obj['lunes'] : '';
            address.obj.hasOwnProperty( 'martes' ) ? updateAddress['custrecord_ptg_martes'] = address.obj['martes'] : '';
            address.obj.hasOwnProperty( 'miercoles' ) ? updateAddress['custrecord_ptg_miercoles'] = address.obj['miercoles'] : '';
            address.obj.hasOwnProperty( 'jueves' ) ? updateAddress['custrecord_ptg_jueves'] = address.obj['jueves'] : '';
            address.obj.hasOwnProperty( 'viernes' ) ? updateAddress['custrecord_ptg_viernes'] = address.obj['viernes'] : '';
            address.obj.hasOwnProperty( 'sabado' ) ? updateAddress['custrecord_ptg_sabado'] = address.obj['sabado'] : '';
            address.obj.hasOwnProperty( 'domingo' ) ? updateAddress['custrecord_ptg_domingo'] = address.obj['domingo'] : '';
            address.obj['cada'] ? updateAddress['custrecord_ptg_cada'] = address.obj['cada'] : '';
            address.obj['frecuencia'] ? updateAddress['custrecord_ptg_periodo_contacto'] = address.obj['frecuencia'] : '';
            address.obj['entre_las'] ? updateAddress['custrecord_ptg_entre_las'] = address.obj['entre_las'] : '';
            address.obj['y_las'] ? updateAddress['custrecord_ptg_y_las'] = address.obj['y_las'] : '';
            address.obj['inThatWeek'] ? updateAddress['custrecord_ptg_en_la_semana'] = address.obj['inThatWeek'] : '';// Hay que actualizar el custom record
            address.obj['startDayService'] ? updateAddress['custrecord_ptg_fecha_inicio_servicio'] = address.obj['startDayService'] : '';// Hay que actualizar el custom record
            address.obj['typeContact'] ? updateAddress['custrecord_ptg_tipo_contacto'] = address.obj['typeContact'] : '';
            address.obj['typeService'] ? updateAddress['custrecord_ptg_tipo_servicio'] = address.obj['typeService'] : '';
            address.obj['frequencyItem'] ? updateAddress['custrecord_ptg_articulo_frecuente'] = address.obj['frequencyItem'] : '';
            address.obj['capacidad'] ? updateAddress['custrecord_ptg_capacidad_art'] = address.obj['capacidad'] : '';
            address.obj['frequencyItem2'] ? updateAddress['custrecord_ptg_articulo_frecuente2'] = address.obj['frequencyItem2'] : '';
            address.obj['capacidad2'] ? updateAddress['custrecord_ptg_capacidad_can_articulo_2'] = address.obj['capacidad2'] : '';
            address.obj['street_aux1'] ? updateAddress['custrecord_ptg_entrecalle_'] = address.obj['street_aux1'] : '';
            address.obj['street_aux2'] ? updateAddress['custrecord_ptg_y_entre_'] = address.obj['street_aux2'] : '';
            address.obj['nameStreet'] ? updateAddress['custrecord_ptg_street'] = address.obj['nameStreet'] : '';
            address.obj['numExterno'] ? updateAddress['custrecord_ptg_exterior_number'] = address.obj['numExterno'] : '';
            address.obj['numInterno'] ? updateAddress['custrecord_ptg_interior_number'] = address.obj['numInterno'] : '';
            address.obj['commentsAddress'] ? updateAddress['custrecord_ptg_obesarvaciones_direccion_'] = address.obj['commentsAddress'] : '';

            dataToSend = {
                "customers" : [
                    {
                        id : customerGlobal.id,
                        bodyFields : {},
                        bodyAddress : [
                            {
                                id : idAddress,
                                addresses : updateAddress
                            }
                        ]
                    }
                ] 
            };
        } else {// Se guarda
            dataToSend = {
                id : customerGlobal.id,
                bodyFields : {
                    'custentity_ptg_indicaciones_cliente' : customerGlobal?.notasCustomer
                },
                bodyAddress : [address.obj]
            }

        }
        
        loadMsg('Guardando dirección...');
        let settings = {
            url      : urlGuardarCliente,
            method   : 'PUT',
            data     : JSON.stringify(dataToSend),
        }
        setAjax(settings).then((response) => {
            infoMsg('success', 'Datos de dirección guardados exitósamente');
            $('div.modal').modal('hide');
            searchCustomer(customerGlobal.id);
        }).catch((error) => {
            infoMsg('error', 'Algo salió mal en la creación del registro');
            console.log('Error en la consulta', error);
        });
    }
}

// Coloca una dirección en el listado de direcciones del cliente
function getAddressOnList() {
    let addressStr = '';
    let customStartTime = customEndTime = new Date();
    let yLas            = $("#lasFormCliente").val();
    let entreLas        = $("#entreFormCliente").val();
    let tipoServicioId  = $("#tipoServicioFormCliente").val();
    //let periodoContacto = $("select#frecuenciaFormCliente").val();
    let horaInicio      = entreLas.split(':');
    let horaFin         = yLas.split(':');
    let periodo         = parseInt($("#frecuenciaFormCliente").val());
    let tipoContacto    = parseInt($("input[name=tipoAccionFormCliente]:checked").val());

    if ( horaInicio.length ) {
        customStartTime.setHours(horaInicio[0]);
        customStartTime.setMinutes(horaInicio[1]);
        horaInicioStr = moment(customStartTime).format('h:mm a');
        console.log('Hora inicio: '+ horaInicioStr);
    }

    if ( horaFin.length ) {
        customEndTime.setHours(horaFin[0]);
        customEndTime.setMinutes(horaFin[1]);
        horaFinStr = moment(customEndTime).format('h:mm a');
        console.log('Hora fin: '+ horaFinStr);
    }

    let addressObj = {
        principal       : $('table.table-address tbody').find(".address").length == 0 ? true : false,
        stateName       : $("#estadoDireccion").val().trim(),
        domFacturacion  : $('#domFacturacionDireccion').is(':checked'),
        city            : $("#municipioDireccion").val().trim(),
        zip             : $("#cpDireccion").val().trim(),
        nameStreet      : $("#calleDireccion").val().trim(),
        numExterno      : $("#exteriorDireccion").val().trim(),
        numInterno      : $("#interiorDireccion").val().trim(),
        colonia         : $("#coloniaDireccion").val().trim(),
        latitud         : "",
        longitud        : "",
        street_aux1     : $("#entre1Direccion").val().trim(),
        street_aux2     : $("#entre2Direccion").val().trim(),
        //zonaVenta       : $("#zonaVentaDireccion").val().trim(),
        ruta            : $("#rutaColoniaIdDireccion").val().trim(),
        idRoute         : $("#rutaIdDireccion").val().trim(),
        idRoute2        : $("#rutaId2Direccion").val().trim(),
        typeContact     : tipoContacto,
        inThatWeek      : ( tipoContacto != 1 && periodo == '3' ? $('#numeroSemana').val() : null ),
        startDayService : ( tipoContacto != 1 ? dateFormatFromDate( $("#fechaInicioServicio").val(), '5' ) : null ),
        cada            : tipoContacto != 1 ? parseInt($("#cadaFormCliente").val()) : null,
        frecuencia      : tipoContacto != 1 ? periodo : null,
        entre_las       : tipoContacto != 1 ? horaInicioStr : null,
        y_las           : tipoContacto != 1 ? horaFinStr : null,
        lunes           : tipoContacto != 1 ? $("#lunesFormCliente").prop("checked") : false,
        martes          : tipoContacto != 1 ? $("#martesFormCliente").prop("checked") : false,
        miercoles       : tipoContacto != 1 ? $("#miercolesFormCliente").prop("checked") : false,
        jueves          : tipoContacto != 1 ? $("#juevesFormCliente").prop("checked") : false,
        viernes         : tipoContacto != 1 ? $("#viernesFormCliente").prop("checked") : false,
        sabado          : tipoContacto != 1 ? $("#sabadoFormCliente").prop("checked") : false,
        domingo         : tipoContacto != 1 ? $("#domingoFormCliente").prop("checked") : false,
        typeService     : parseInt($("#tipoServicioFormCliente").val()),
        commentsAddress : $("#indicacionesFormCliente").val().trim(),
        tag             : ''
    }

    // Se agregan campos acorde al tipo de servicio
    if ( tipoServicioId == "1" ) {// Cilindros
        addressObj['frequencyItem']  = $("#articuloFrecuenteCilFormCliente").val();
        addressObj['capacidad']      = $("#inputCapacidadCilTipoServicio").val();
    } else if ( tipoServicioId == "2" ) {// Estacionarios
        addressObj['frequencyItem']  = $("#articuloFrecuenteEstFormCliente").val();
        addressObj['capacidad']      = $("#inputCapacidadEstTipoServicio").val();
    } else if ( tipoServicioId == "4" ) {// Ambos
        addressObj['frequencyItem' ] = $("#articuloFrecuenteCilFormCliente").val();
        addressObj['capacidad']      = $("#inputCapacidadCilTipoServicio").val();
        addressObj['frequencyItem2'] = $("#articuloFrecuenteEstFormCliente").val();
        addressObj['capacidad2']     = $("#inputCapacidadEstTipoServicio").val();
    }

    addressStr += addressObj['nameStreet'];
    addressObj['numExterno'] ? addressStr+= ' #'+addressObj['numExterno'] : '';
    addressObj['colonia']    ? addressStr+= ', Col. '+addressObj['colonia'] : '';
    addressObj['stateName']  ? addressStr+= ', '+addressObj['stateName'] : '';
    addressObj['city']       ? addressStr+= ', '+addressObj['city'] : '';
    addressObj['zip']        ? addressStr+= ', C.P. '+addressObj['zip'] : '';
    addressObj['zonaVenta']  ? addressStr+= '<br>Zona de venta: '+addressObj['zonaVenta'] : '';
    addressObj['ruta']       ? addressStr+= '<br>Ruta: '+addressObj['ruta'] : '';

    addressObj['domFacturacion'] = addressStr ? true : false;
    return {
        str : addressStr,
        obj : addressObj
    };
}

// Formatea la fecha retornada de un campo de netsuite
function getMomentDateFormat(netSuiteDate, format = 'YYYY-MM-DD') {
    let aux = netSuiteDate.split('/');
    let newDate = moment();

    if (! aux.length ) {
        return null;
    }

    newDate.set('year', aux[2]);
    newDate.set('month', Number(parseInt(aux[1])) - 1);  // April
    newDate.set('date', aux[0]);

    return newDate.format(format);
}