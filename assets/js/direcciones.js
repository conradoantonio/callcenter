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
    let requiereFactura = $("input[name=requiereFactura]:checked").val();
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
        !$("#entre1Direccion").val().trim()    ||
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
        // Valida que el domicilio d facturación sólo lo tenga una dirección
        validateTableAddress(address.obj);
        // Si es la primera dirección que se agrega, se limpia el texto por defecto de la tabla
        if (! numAddress ) {
            $('table.table-address tbody').children('tr').remove();
        }
        //console.log(address);
        if(address.obj.domFacturacion) {
            let trs = $('table.table-address tbody').find(".address");
            for (let x = 0; x < trs.length; x++) {
                const element = $(trs[x]);
                let addressAux = element.data('address');
                addressAux.domFacturacion = false;
                element.data('address', address);
                element.find('.check-fact').parent().html('<i class="fa-regular fa-square color-primary check-fact" style="cursor: pointer;"></i>');
            }
        }
        $('table.table-address tbody').append(
            '<tr class="address" data-time="'+address.obj.timeUnix+'" data-address='+"'"+JSON.stringify(address.obj)+"'"+'>'+
                '<td>'+address.str+'</td>'+
                '<td class="text-center">'+
                    '<div class="text-center" style="font-size: 26px;">'+
                        (address.obj.principal ? '<i class="fa-solid fa-square-check color-primary check-entrega" style="cursor: pointer;"></i>' : '<i class="fa-regular fa-square color-primary check-entrega" style="cursor: pointer;"></i>')+
                    '</div>'+
                '</td>'+
                '<td class="text-center dato-facturacion '+($("input[name=requiereFactura]:checked").val() == "si" ? '' : 'd-none')+'">'+
                    '<div class="text-center" style="font-size: 26px;">'+
                        (address.obj.domFacturacion ? '<i class="fa-solid fa-square-check color-primary check-fact" style="cursor: pointer;"></i>' : '<i class="fa-regular fa-square color-primary check-fact" style="cursor: pointer;"></i>')+
                    '</div>'+/*'<div class="text-center" style="font-size: 20px;">'+
                        '<div class="content-input content-input-primary">'+
                            '<input id="domFacturacionDireccion'+address.obj.timeUnix+'" type="checkbox" class="form-check-input form-ptg address-table" '+(address.obj.domFacturacion ? 'checked' : '')+' style="width: auto;" value="">'+
                        '</div>'+
                        // (address.obj.principal ? '<i class="fa-solid fa-square-check color-primary check-entrega" style="cursor: pointer;"></i>' : '<i class="fa-regular fa-square color-primary check-entrega" style="cursor: pointer;"></i>')+
                    '</div>'+*/
                '</td>'+
                '<td class="text-center">'+
                    // '<button class="btn btn-sm btn-info edit-address"> <i class="fa fa-pen-to-square"></i> </button>&nbsp;&nbsp;'+
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
            address.obj['colonia'] ? updateAddress['custrecord_ptg_nombre_colonia'] = address.obj['colonia'] : '';
            address.obj['lunes'] ? updateAddress['custrecord_ptg_lunes'] = address.obj['lunes'] : '';
            address.obj['stateName'] ? updateAddress['custrecord_ptg_estado'] = address.obj['stateName'] : '';
            address.obj['ruta'] ? updateAddress['custrecord_ptg_colonia_ruta'] = address.obj['ruta'] : '';
            address.obj['idRoute'] ? updateAddress['custrecord_ptg_ruta_asignada'] = address.obj['idRoute'] : '';
            address.obj['idRoute2'] ? updateAddress['custrecord_ptg_ruta_asignada2'] = address.obj['idRoute2'] : '';
            address.obj['idRoute3'] ? updateAddress['custrecord_ptg_ruta_asignada_3'] = address.obj['idRoute3'] : '';
            address.obj['idRoute4'] ? updateAddress['custrecord_ptg_ruta_asignada_4'] = address.obj['idRoute4'] : '';
            // address.obj['idRoute'] ? updateAddress['custrecord_ptg_ruta_asignada'] = address.obj['idRoute'] : '';
            // address.obj['idRoute2'] ? updateAddress['custrecord_ptg_ruta_asignada2'] = address.obj['idRoute2'] : '';
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
            address.obj.tag = $("#direccionCliente").children("option").length > 9 ? $("#direccionCliente").children("option").length.toString() : "0"+$("#direccionCliente").children("option").length.toString();
            address.obj.defaultshipping = false;
            address.obj.addresses = {defaultshipping : false}
            address.obj.principal = false;
            dataToSend = {
                "customers" : [
                    {
                        id : customerGlobal.id,
                        bodyFields : {
                            'custentity_ptg_indicaciones_cliente' : customerGlobal?.notasCustomer
                        },
                        bodyAddress : [
                            address.obj                          
                        ]
                    }
                ]
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

var globalTimeout = null;  

function getDirrecionByCPDelay($event) {
    if (globalTimeout != null) {
        clearTimeout(globalTimeout);
    }
    globalTimeout = setTimeout(function() {
        globalTimeout = null;  
        //ajax code
        if($("#cpDireccion").val() && $("#cpDireccion").val().trim().length >= 5) {
            getDirrecionByCP();
        } else {
            $("#coloniaDireccion").children("option").removeClass("d-none");
            $("#coloniaDireccion").val(null).trigger("change");
        }
        //
    }, 1000);  
}

function getDirrecionByCP(callback = null) {
    let settings = {
        url      : urlGetAddressOfZIP,
        method   : 'POST',
        data     : JSON.stringify({
            "zip" : $("#cpDireccion").val()
        }),
    }
    setAjax(settings).then((response) => {
        console.log(response);
        if(response.data.length > 0) {
            let plantaActual   = $("#plantas option:selected").text().trim();
            let coloniasAux = [];
            
            response.data.forEach(element => {
                if(element.rutaCil && element.rutaCil.split(":")[0].trim() == plantaActual || 
                   element.rutaEsta && element.rutaEsta.split(":")[0].trim() == plantaActual  || 
                   element.rutaCilVesp && element.rutaCilVesp.split(":")[0].trim() == plantaActual  || 
                   element.rutaEstVesp && element.rutaEstVesp.split(":")[0].trim() == plantaActual ) {
                    coloniasAux.push(element);
                }
            });
            //console.log(coloniasAux);
            if(coloniasAux.length > 0) {
                if(coloniasAux.length == 1) {
                    $("#estadoDireccion").val(coloniasAux[0].state);
                    if($("#estadoDireccion").children('option').length > 2) {
                        getMunicipios(false, function() {
                            $("#municipioDireccion").val(coloniasAux[0].country);
                            if($("#municipioDireccion").children('option').length > 2) {
                                getColonias(false, function() {
                                    $("#coloniaDireccion").children('option').addClass("d-none");
                                    $("#coloniaDireccion").children('option[data-cp="'+$("#cpDireccion").val().trim()+'"]').removeClass("d-none");
                                    $("#coloniaDireccion").children('option[value=""]').removeClass("d-none");
                                    $("#coloniaDireccion").val(coloniasAux[0].colonia).trigger("change");
                                })
                            } else {
                                $("#coloniaDireccion").children('option').addClass("d-none");
                                $("#coloniaDireccion").children('option[data-cp="'+$("#cpDireccion").val().trim()+'"]').removeClass("d-none");
                                $("#coloniaDireccion").children('option[value=""]').removeClass("d-none");
                                $("#coloniaDireccion").val(coloniasAux[0].colonia).trigger("change");
                            }
                        });
                    } else {
                        $("#municipioDireccion").val(coloniasAux[0].country);
                        if($("#municipioDireccion").children('option').length > 2) {
                            getColonias(false, function() {
                                $("#coloniaDireccion").children('option').addClass("d-none");
                                $("#coloniaDireccion").children('option[data-cp="'+$("#cpDireccion").val().trim()+'"]').removeClass("d-none");
                                $("#coloniaDireccion").children('option[value=""]').removeClass("d-none");
                                $("#coloniaDireccion").val(coloniasAux[0].colonia).trigger("change");
                            })
                        } else {
                            $("#coloniaDireccion").children('option').addClass("d-none");
                            $("#coloniaDireccion").children('option[data-cp="'+$("#cpDireccion").val().trim()+'"]').removeClass("d-none");
                            $("#coloniaDireccion").children('option[value=""]').removeClass("d-none");
                            $("#coloniaDireccion").val(coloniasAux[0].colonia).trigger("change");
                        }
                    }
                } else {
                    $("#coloniaDireccion").children('option').addClass("d-none");
                    $("#coloniaDireccion").children('option[data-cp="'+$("#cpDireccion").val().trim()+'"]').removeClass("d-none");
                    $("#coloniaDireccion").children('option[value=""]').removeClass("d-none");
                    $("#coloniaDireccion").val(null).trigger("change");
                }
            } else {
                infoMsg('warning', 'Alerta:', 'No se encontraron datos para el Código Postal proporcionado');
            }

            if(callback) {
                callback();
            }
        } else {
            infoMsg('warning', 'Alerta:', 'No se encontraron datos para el Código Postal proporcionado');
        }
    }).catch((error) => {
        console.log('Error en la consulta', error);
    });
}

function getEstados(trigger = false, callback = null) {
    let settings = {
        url      : urlGetEstados,
        method   : 'POST',
        data     : JSON.stringify({
            "planta" : $("#plantas option:selected").text().trim()
        }),
    }
    setAjax(settings).then((response) => {
        if(response.data.length > 0) {
            let dataEst = {};
            response.data.forEach(element => {
                if(!dataEst[element.state]) {
                    dataEst[element.state] = element;
                }
            });
            console.log(dataEst);
            setDataDireccion(dataEst, $("#estadoDireccion"), trigger);

            if(callback) {
                callback();
            }
        } else {
            $("#estadoDireccion").val(null).trigger("change");
            infoMsg('warning', 'Alerta:', 'No se encontraron estados para la planta actual favor de volver a intentarlo');
        }
    }).catch((error) => {
        infoMsg('warning', 'Alerta:', 'No se encontraron estados para la planta actual favor de volver a intentarlo');
    });
}

function getMunicipios(trigger = false, callback = null) {
    if(!$("#estadoDireccion").val()) {
        $("#municipioDireccion").val(null).trigger("change");
    } else {
        let settings = {
            url      : urlGetMunicipios,
            method   : 'POST',
            data     : JSON.stringify({
                "planta" : $("#plantas option:selected").text().trim(),
                "estado" : $("#estadoDireccion").val().trim()
            }),
        }
        setAjax(settings).then((response) => {
            if(response.data.length > 0) {
                let dataMun = {};
                response.data.forEach(element => {
                    if(!dataMun[element.country]) {
                        dataMun[element.country] = element;
                    }
                });
                console.log(dataMun);
                setDataDireccion(dataMun, $("#municipioDireccion"), trigger);
    
                if(callback) {
                    callback();
                }
            } else {
                $("#municipioDireccion").val(null).trigger("change");
                infoMsg('warning', 'Alerta:', 'No se encontraron municipios para la planta actual favor de volver a intentarlo');
            }
        }).catch((error) => {
            infoMsg('warning', 'Alerta:', 'No se encontraron municipios para la planta actual favor de volver a intentarlo');
        });   
    }    
}

function getColonias(trigger = false, callback = null) {
    if(!$("#municipioDireccion").val()) {
        $("#coloniaDireccion").val(null).trigger("change");
    } else {
        let settings = {
            url      : urlGetColonias,
            method   : 'POST',
            data     : JSON.stringify({
                "planta" : $("#plantas option:selected").text().trim(),
                "estado" : $("#estadoDireccion").val().trim(),
                "municipio" : $("#municipioDireccion").val().trim()
            }),
        }
        setAjax(settings).then((response) => {
            if(response.data.length > 0) {
                let dataCol = {};
                response.data.forEach(element => {
                    if(!dataCol[element.colonia]) {
                        dataCol[element.colonia] = element;
                    }
                });
                console.log(dataCol);
                setDataDireccion(dataCol, $("#coloniaDireccion"), trigger);
    
                if(callback) {
                    callback();
                }
            } else {
                $("#coloniaDireccion").val(null).trigger("change");
                infoMsg('warning', 'Alerta:', 'No se encontraron colonias para la planta actual favor de volver a intentarlo');
            }
        }).catch((error) => {
            infoMsg('warning', 'Alerta:', 'No se encontraron colonias para la planta actual favor de volver a intentarlo');
        });   
    }    
}

function setDataDireccion(items, elem, trigger = true) {
    elem.children('option').remove();
    elem.append('<option value="">Seleccione una opción</option>');

    Object.keys(items).forEach(element => {
        elem.append('<option '+(items[element].zip ? 'data-cp="'+items[element].zip+'"' : '')+' data-item='+"'"+JSON.stringify(items[element])+"'"+' value="'+element+'">'+element+'</option>');
    });

    if(Object.keys(items).length == 1) {
        if(trigger) {
            elem.val(Object.keys(items)[0]).trigger("change");
        } else {
            elem.val(Object.keys(items)[0]);
        }
        elem.prop("disabled", true);
    } else {
        elem.val(null);
        elem.prop("disabled", false);
    }
}

// Muestra las rutas acorde a si la dirección otorgada es cilindro, estacionario o ambas
function setTextRoutesByAddress(address) {
    $('.r-cil, .r-est').addClass('d-none');
    
    if ( address.typeServiceId == 1 ) {// Cilindro
        $('.r-cil').removeClass('d-none');

        $('#rutaCilMat').text(address.route ? getRouteNumber(address.route) : 'Sin ruta');
        $('#rutaCilVesp').text(address.route2 ? getRouteNumber(address.route2) : 'Sin ruta');
        $('#rutaCilMat').prop('title', address.route ? getRouteStr(address.route) : 'Sin ruta');
        $('#rutaCilVesp').prop('title', address.route2 ? getRouteStr(address.route2) : 'Sin ruta');
    } 
    else if ( address.typeServiceId == 2 ) {// Estacionario
        $('.r-est').removeClass('d-none');

        $('#rutaEstMat').text(address.route ? getRouteNumber(address.route) : 'Sin ruta');
        $('#rutaEstVesp').text(address.route2 ? getRouteNumber(address.route2) : 'Sin ruta');
        $('#rutaEstMat').prop('title', address.route ? getRouteStr(address.route) : 'Sin ruta');
        $('#rutaEstVesp').prop('title', address.route2 ? getRouteStr(address.route2) : 'Sin ruta');
    } 
    else if ( address.typeServiceId == 4 ) {// Ambos
        $('.r-cil, .r-est').removeClass('d-none');

        $('#rutaCilMat').text(address.route ? getRouteNumber(address.route) : 'Sin ruta');
        $('#rutaCilVesp').text(address.route2 ? getRouteNumber(address.route2) : 'Sin ruta');
        $('#rutaEstMat').text(address.route3 ? getRouteNumber(address.route3) : 'Sin ruta');
        $('#rutaEstVesp').text(address.route4 ? getRouteNumber(address.route4) : 'Sin ruta');
    
        $('#rutaCilMat').prop('title', address.route ? getRouteStr(address.route) : 'Sin ruta');
        $('#rutaCilVesp').prop('title', address.route2 ? getRouteStr(address.route2) : 'Sin ruta');
        $('#rutaEstMat').prop('title', address.route3 ? getRouteStr(address.route3) : 'Sin ruta');
        $('#rutaEstVesp').prop('title', address.route4 ? getRouteStr(address.route4) : 'Sin ruta');
    }

    
    initTooltips();
}

// Obtiene la ruta completa de la dirección
function getRouteStr(route) {
    let splited = route.split(':');

    return splited[1] ?? 'Sin ruta';
}

// Obtiene el número del vehículo la ruta
function getRouteNumber(route) {
    let rutaSplited = route.split(':');
    let nombreRuta  = '';
    let numeroRuta  = '';
    if ( rutaSplited[1] ) {// Tiene secciones
        nombreRuta = rutaSplited[1].split(' - ');

        if ( nombreRuta.length && nombreRuta[0] ) {
            numeroRuta = nombreRuta[0].split('-');
            if (numeroRuta.length && numeroRuta[2]) {
                return numeroRuta[2];

            }
        }
    }

    return 'Sin ruta';
}

// Coloca una dirección en el listado de direcciones del cliente
function getAddressOnList() {
    let addressStr = '';
    let requiereFactura = $("input[name=requiereFactura]:checked").val();
    let customStartTime = customEndTime = new Date();
    let yLas            = $("#lasFormCliente").val();
    let entreLas        = $("#entreFormCliente").val();
    let tipoServicioId  = $("#tipoServicioFormCliente").val();
    //let periodoContacto = $("select#frecuenciaFormCliente").val();
    let horaInicio      = entreLas.split(':');
    let horaFin         = yLas.split(':');
    let periodo         = parseInt($("#frecuenciaFormCliente").val());
    let tipoContacto    = parseInt($("input[name=tipoAccionFormCliente]:checked").val());
    let domFacturacion  = $('#domFacturacionDireccion').is(':checked');
    let coloniaRutas    = $('#coloniaDireccion').children(':selected').data('item');

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
        timeUnix        : Date.now(),
        principal       : $('table.table-address tbody').find(".address").length == 0 ? true : false,
        stateName       : $("#estadoDireccion").val().trim(),
        domFacturacion  : ( $('table.table-address tbody').find(".address").length == 0 ? (requiereFactura == 'si' ? true : false) : ( requiereFactura == 'si' ? $('#domFacturacionDireccion').is(':checked') : false ) ),
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
        ruta            : $("#coloniaDireccion option:selected").data("item").id,//$("#rutaColoniaIdDireccion").val().trim(),
        // idRoute         : parseInt($("#tipoServicioFormCliente").val()) == 1 || parseInt($("#tipoServicioFormCliente").val()) == 4 ? $("#coloniaDireccion option:selected").data("item").rutaCilId : $("#coloniaDireccion option:selected").data("item").rutaEstaId,//$("#rutaIdDireccion").val().trim(),
        // idRoute2        : parseInt($("#tipoServicioFormCliente").val()) == 4 ? $("#coloniaDireccion option:selected").data("item").rutaEstaId : null,//$("#rutaId2Direccion").val().trim(),
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

    // Se setean las rutas de las rutas de la colonia seleccionada
    // if ( coloniaRutas && coloniaRutas.rutaCilId ) { addressObj['idRoute'] = coloniaRutas.rutaCilId; }
    // if ( coloniaRutas && coloniaRutas.rutaCilVespId ) { addressObj['idRoute2'] = coloniaRutas.rutaCilVespId; }
    // if ( coloniaRutas && coloniaRutas.rutaEstaId ) { addressObj['idRoute3'] = coloniaRutas.rutaEstaId; }
    // if ( coloniaRutas && coloniaRutas.rutaEstVespId ) { addressObj['idRoute4'] = coloniaRutas.rutaEstVespId; }

    addressObj['idRoute'] = coloniaRutas && coloniaRutas.rutaCilId ? coloniaRutas.rutaCilId : null;
    addressObj['idRoute2'] = coloniaRutas && coloniaRutas.rutaCilVespId ? coloniaRutas.rutaCilVespId : null;
    addressObj['idRoute3'] = coloniaRutas && coloniaRutas.rutaEstaId ? coloniaRutas.rutaEstaId : null;
    addressObj['idRoute4'] = coloniaRutas && coloniaRutas.rutaEstVespId ? coloniaRutas.rutaEstVespId : null;

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

    // addressObj['domFacturacion'] = $('table.table-address tbody').find(".address").length == 0 ? true : $('#domFacturacionDireccion').is(':checked');
    return {
        str : addressStr,
        obj : addressObj
    };
}

// Cada que se agrega una dirección, iterará las direcciones para actualizar el domFacturación en caso de que se haya enviado
function validateTableAddress(objAddress) {
    let trDirecciones = $('#tab-client-domicilio table.table-address tbody').children('tr.address');
    // Si la dirección actual es el domicilio de facturación, entonces todas se desmarcan a excepción de la suya
    if ( objAddress.domFacturacion == true ) {
        $('input.address-table').prop('checked', false);// Desmarca todos los check de la tabla
        $('input#domFacturacionDireccion'+objAddress.timeUnix).prop('checked', true);
    }
    // domFacturacionDireccion'+address.obj.timeUnix+'
    trDirecciones.each(function( index ) {
        let direccion = $(this).data('address');
        if ( direccion.timeUnix != objAddress.timeUnix ) {// Va a verificar todas las direcciones a excepción de la creada recientemente
            
            if ( objAddress.domFacturacion == true ) {// Si la dirección recientemente agregada es de facturación, se remueven todas las anteriores
                direccion['domFacturacion'] = false;
            }
            console.log('Se actualizará esta dirección');
        }
        $(this).data('address', direccion);
    });
}

// Checa si se clickea el domicilio de facturación
$('body').delegate('input.address-table','change', function() {
    // Falta código para deschequear los otros checkbox
    let parent = $(this).parent().parent().parent().parent();
    let direccion = parent.data('address');

    if( this.checked ) {
        direccion['domFacturacion'] = true;
    } else {
        direccion['domFacturacion'] = false;
    }
    parent.data('address', direccion);

    validateTableAddress(direccion);
});

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