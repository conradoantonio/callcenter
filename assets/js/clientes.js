// Revisa que acción ejecutará el modal de acuerdo al botón cliqueado
$("#agregarDirecciones, #agregarDireccion").click( function() {
    let id = $(this).attr('id');

    if ( id == 'agregarDirecciones' ) {
        $("#tipoAccionDireccion").val('lista');
        $("input[name=tipoAccionFormCliente][value=1]").prop("checked", true);
        $("input[name=tipoAccionFormCliente]:checked").trigger("change");
        $("#tipoServicioFormCliente").val("1");
        $("#tipoServicioFormCliente").trigger("change");
    } else if ( id == 'agregarDireccion' ) {
        $("#tipoAccionDireccion").val('guardar');
    }
});

// Si el clienge requiere factura, se mostrarán esos campos en el form de cliente
$('input[name=requiereFactura]').on('change', function(e) {
    let val = $("input[name=requiereFactura]:checked").val();
    if ( val == "si" ) {// Se muestran los datos exclusivos de factura
        $(".dato-facturacion").removeClass("d-none");
    } else {// Se ocultan los campos de factura
        $(".dato-facturacion").addClass("d-none");
    }
});

// Si el cliente es de régimen moral, muestra el campo para la razón social, caso contrario, se muestran los de régimen físico (Doméstico)
$('input[name=tipoRegimen]').on('change', function(e) {
    let val = $("input[name=tipoRegimen]:checked").val()
    if ( val == "domestico" ) {// Se muestran los datos de régimen físico
        $(".dato-regimen-fisico").removeClass("d-none");
        $(".dato-regimen-moral").addClass("d-none");
    } else if( val == "comercial" || val == "industrial" ) {// Se muestran los campos de régimen moral
        $(".dato-regimen-moral").removeClass("d-none");
        $(".dato-regimen-fisico").addClass("d-none");
    }
});

// Cuando el select de estados cambie, manda a llamar la petición de obtener ciudades
$('select#direccionCliente').on('change', function(e) {
    let direccion = $( this ).children('option:selected').data('address');
    console.log('esta es la dirección', direccion);
    resetProductList();
    if ( direccion ) {
        setColoniaZonaData( direccion );
    } else {// Podría ser buena práctica meter este bloque de código en una función
        // Estos campos están en la tarjeta de cliente
        $('#zonaVentaCliente').text('Sin Zona de Venta');
        $('#zonaPrecioCliente').text('Sin Zona de Precio');
        $('#rutaCliente').text("Sin ruta");
        
        // Estos campos están en el formulario de pedido
        $('#zonaVentaPedido, #desdePedido, #hastaPedido').val('');
    }
});

// Setea el formulario de cliente para guardar uno nuevo
$("#agregarCliente").click(function () {
    clearCustomerForm();
    next('inicio');
    $("div.domicilio-tab").removeClass('d-none');
    $("div.guardar-cliente-edit").addClass('d-none');
    $("button.next-to-domicilio").parent().removeClass('d-none');// Se muestra el botón de siguiente para visualizar la vista de domicilio
    

    $("#home-view, #btnMenu").addClass("d-none");
    $("#form-client-view, #btnBack").removeClass("d-none");
    $("#btnBack").data("back", "home-view");
    $("#btnBack").data("current", "form-client-view");
    $("#btnBack").data("title-back", "Call Center");
    $("#header-title").html("Alta de cliente");
});

// Configura el formulario de edición del cliente
$("#editarCliente").click(function () {
    clearCustomerForm();
    next('inicio');
    $("#home-view, #btnMenu").addClass("d-none");
    $("#form-client-view, #btnBack").removeClass("d-none");
    $("#btnBack").data("back", "home-view");
    $("#btnBack").data("current", "form-client-view");
    $("#btnBack").data("title-back", "Call Center");
    $("#header-title").html("Edición de cliente");

    $("div.domicilio-tab").addClass('d-none');
    $("div.guardar-cliente-edit").removeClass('d-none');
    $("button.next-to-domicilio").parent().addClass('d-none');// Se remueve el botón de siguiente para visualizar la vista de domicilio

    // Este input definirá si es una edición por el id interno del cliente
    $('#idInternoFormCliente').val(customerGlobal.id);

    // Se prellenan los inputs del form
    if ( customerGlobal.typeCustomer == "Doméstico" ) {
        $("input#tipoRegimen1").prop('checked', true);
        $(".dato-regimen-fisico").removeClass("d-none");
        $(".dato-regimen-moral").addClass("d-none");
    } else if ( customerGlobal.typeCustomer == "Comercial" ) {
        $("input#tipoRegime2").prop('checked', true);
    } else if ( customerGlobal.typeCustomer == "Industrial" ) {
        $("input#tipoRegime3").prop('checked', true);
    }

    // Si es comercial o industrial
    if ( customerGlobal.typeCustomer == "Comercial" || customerGlobal.typeCustomer == "Industrial" ) {
        $('#nombreRazonSocialFormCliente').val(customerGlobal.nombreCompleto);
        $('#giroNegocioFormCliente').parent().removeClass('d-none');
        $(".dato-regimen-fisico").addClass("d-none");
        $(".dato-regimen-moral").removeClass("d-none");
    }

    if ( customerGlobal.giroCustomerId ) {
        $('#giroNegocioFormCliente').val(customerGlobal.giroCustomerId);
    }

    if ( customerGlobal.rfc ) {
        $("input#requiereFactura1").prop('checked', true);
        $(".dato-facturacion").removeClass("d-none");
        $('#rfcFormCliente').val(customerGlobal.rfc);
        $('#usoCfdiFormCliente').val(customerGlobal.cdfiId);
        
    } else {
        $(".dato-facturacion").addClass("d-none");
    }

    // Se setean los demás campos de forma natural
    $('#nombreFormCliente').val(customerGlobal.primerNombre);
    $('#apellidosFormCliente').val(customerGlobal.apellidos);
    
    $('#correoFormCliente').val(customerGlobal.email);
    $('#telefonoPrincipalFormCliente').val(customerGlobal.telefono);
    $('#telefonoAlternoFormCliente').val(customerGlobal.telefonoAlt);
    $('#correoAlternativoFormCliente').val(customerGlobal.emailAlt);
    $('#observacionesFormCliente').val(customerGlobal.notasCustomer);
});

// Valida una dirección a guardar
$("button#guardarDireccion").click( function() {
    validateAddressFields();
});

// Click en guardar cliente
$("button#guardarCliente").click( function() {
    saveCustomer();
});

// Método para validar los campos de una dirección
function validateAddressFields() {
    let tipoAccion = $("#tipoAccionDireccion").val();
    let canContinue = false;
    let numAddress = $('table.table-address tbody').children('tr.address').length;

    if(
        !$("#estadoDireccion").val().trim()    ||
        !$("#municipioDireccion").val().trim() ||
        !$("#coloniaDireccion").val().trim()   ||
        !$("#cpDireccion").val().trim()        ||
        !$("#calleDireccion").val().trim()     ||
        !$("#exteriorDireccion").val().trim()  ||
        //!$("#interiorDireccion").val().trim()  ||
        //!$("#entre1Direccion").val().trim()    ||
        //!$("#entre2Direccion").val().trim()    ||
        !$("#zonaVentaDireccion").val().trim() ||
        !$("#rutaDireccion").val().trim() ||
        !$("#tipoServicioFormCliente").val().trim() ||
        ( $("#tipoServicioFormCliente").val() == 1 && ( !$("#articuloFrecuenteCilFormCliente").val() || !$("#inputCapacidadCilTipoServicio").val() ) ) ||
        ( $("#tipoServicioFormCliente").val() == 2 && ( !$("#articuloFrecuenteEstFormCliente").val() || !$("#inputCapacidadEstTipoServicio").val().trim() ) ) ||
        ( $("#tipoServicioFormCliente").val() == 4 && ( !$("#articuloFrecuenteCilFormCliente").val() || !$("#inputCapacidadCilTipoServicio").val() || !$("#articuloFrecuenteEstFormCliente").val() || !$("#inputCapacidadEstTipoServicio").val().trim() ) ) ||
        ($("input[name=tipoAccionFormCliente]:checked").val() != "1" && !$("#cadaFormCliente").val().trim()) ||
        ($("input[name=tipoAccionFormCliente]:checked").val() != "1" && (!$("#frecuenciaFormCliente").val() || !$("#frecuenciaFormCliente").val().trim())) ||
        ($("input[name=tipoAccionFormCliente]:checked").val() != "1" && !$("#entreFormCliente").val().trim()) ||
        ($("input[name=tipoAccionFormCliente]:checked").val() != "1" && !$("#lasFormCliente").val().trim()) ||
        ($("input[name=tipoAccionFormCliente]:checked").val() != "1" && !$("#lunesFormCliente").prop("checked") && !$("#martesFormCliente").prop("checked") && !$("#miercolesFormCliente").prop("checked") && !$("#juevesFormCliente").prop("checked") && !$("#viernesFormCliente").prop("checked") && !$("#sabadoFormCliente").prop("checked") && !$("#domingoFormCliente").prop("checked"))
    ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if( canContinue ) {

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
                address.obj['lunes'] ? updateAddress['custrecord_ptg_lunes'] = address.obj['lunes'] : '';
                address.obj['martes'] ? updateAddress['custrecord_ptg_martes'] = address.obj['martes'] : '';
                address.obj['miercoles'] ? updateAddress['custrecord_ptg_miercoles'] = address.obj['miercoles'] : '';
                address.obj['jueves'] ? updateAddress['custrecord_ptg_jueves'] = address.obj['jueves'] : '';
                address.obj['viernes'] ? updateAddress['custrecord_ptg_viernes'] = address.obj['viernes'] : '';
                address.obj['sabado'] ? updateAddress['custrecord_ptg_sabado'] = address.obj['sabado'] : '';
                address.obj['domingo'] ? updateAddress['custrecord_ptg_domingo'] = address.obj['domingo'] : '';
                address.obj['cada'] ? updateAddress['custrecord_ptg_cada'] = address.obj['cada'] : '';
                address.obj['frecuencia'] ? updateAddress['custrecord_ptg_periodo_contacto'] = address.obj['frecuencia'] : '';
                address.obj['entre_las'] ? updateAddress['custrecord_ptg_entre_las'] = address.obj['entre_las'] : '';
                address.obj['y_las'] ? updateAddress['custrecord_ptg_y_las'] = address.obj['y_las'] : '';
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
            // saveAddress(dataToSend);
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
        
    } else {
        alert("Favor de llenar todos los campos con *");
    }
}

$('body').delegate('.check-entrega', 'click', function () {
    let address = $(this).closest('.address').data('address');
    if(!address.principal) {
        for (let x = 0; x < $('table.table-address tbody').find(".address").length; x++) {
            let element = $($('table.table-address tbody').find(".address")[x]);
            let addressAux = element.data('address');
            if(addressAux.principal) {
                addressAux.principal = false;
                element.data('address', addressAux);
                element.find('.check-entrega').parent().html('<i class="fa-regular fa-square color-primary check-entrega" style="cursor: pointer;"></i>');
            }
        }

        address.principal = true;
        $(this).closest('.address').data('address', address);
        $(this).parent().html('<i class="fa-solid fa-square-check color-primary check-entrega" style="cursor: pointer;"></i>');
    }
});

$('body').delegate('.delete-address', 'click', function () {
    confirmMsg("warning", "¿Seguro que desea eliminar la dirección?", function(resp) {
        if(resp) {
            let address = $(this).closest('.address').data('address');
            if(address.principal && $('table.table-address tbody').find(".address").length > 1) {
                $(this).closest('.address').remove();
                let element = $($('table.table-address tbody').find(".address")[0]);
                let addressAux = element.data('address');
                addressAux.principal = true;
                element.data('address', address);
                element.find('.check-entrega').parent().html('<i class="fa-solid fa-square-check color-primary check-entrega" style="cursor: pointer;"></i>');
            } else {
                $(this).closest('.address').remove();
            }
        }
    })
});

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
        typeContact     : parseInt($("input[name=tipoAccionFormCliente]:checked").val()),
        cada            : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? parseInt($("#cadaFormCliente").val()) : null,
        frecuencia      : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? parseInt($("#frecuenciaFormCliente").val()) : null,
        entre_las       : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? horaInicioStr : null,
        y_las           : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? horaFinStr : null,
        lunes           : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? $("#lunesFormCliente").prop("checked") : null,
        martes          : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? $("#martesFormCliente").prop("checked") : null,
        miercoles       : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? $("#miercolesFormCliente").prop("checked") : null,
        jueves          : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ?  $("#juevesFormCliente").prop("checked") : null,
        viernes         : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? $("#viernesFormCliente").prop("checked") : null,
        sabado          : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? $("#sabadoFormCliente").prop("checked") : null,
        domingo         : $("input[name=tipoAccionFormCliente]:checked").val() != "1" ? $("#domingoFormCliente").prop("checked") : null,
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

// Método que llama un reslet para guardar una nueva dirección a un cliente
function saveAddress(dataToSend) {
    let arrayCustomers = [];

    arrayCustomers.push(dataToSend);

    let dataCustomerBody = {
        "customers" : arrayCustomers,
    };

    $.ajax({
        url: urlGuardarCliente,
        method: 'PUT',
        data: JSON.stringify(dataCustomerBody),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
            console.log('Data: ', data);

            if ( data.success ) {
                infoMsg('success', 'Dirección actualizada exitósamente');
                $('div.modal').modal('hide');
                searchCustomer(customerGlobal.telefono);
            } else {
                infoMsg('error', 'Dirección no creada', 'Revise que la información proporcionada sea la correcta')
            }

        }, error: function (xhr, status, error) {
            infoMsg('error', 'Algo salió mal en la creación del registro');
            console.log('Error en la consulta', xhr, status, error);
        }
    });
}

// Guarda la información de un cliente en Netsuite
function saveCustomer() {
    let canContinue = false;
    let tipoRegimen     = $("input[name=tipoRegimen]:checked").val();
    let requiereFactura = $("input[name=requiereFactura]:checked").val();

    if(
        ( tipoRegimen == 'domestico' && ( !$("#nombreFormCliente").val() || !$("#apellidosFormCliente").val() ) ) || //Debe tener nombre y apellido si es doméstico
        ( tipoRegimen != 'domestico' && ( !$("#nombreRazonSocialFormCliente").val() ) ) || //Debe tener el nombre de la razón social
        ( requiereFactura == 'si' && ( !$("#rfcFormCliente").val() || !$("#usoCfdiFormCliente").val() || !$("#correoAlternativoFormCliente").val() ) ) || // Si requiere factura, debe incluir RFC, correo de facturación y el uso de CFDI
        ( !$("input#idInternoFormCliente").val() && $('table.table-address tbody').find(".address").length == 0 ) // Si es un registro nuevo, debe almacenar al menos una dirección
    ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if ( canContinue ) {
        let idCliente    = $("input#idInternoFormCliente").val();
        let businessType = tipoRegimen != 'domestico' ? $('select#giroNegocioFormCliente').val() : "";
        let businessName = $('#nombreRazonSocialFormCliente').val();
        let cfdi         =  $('#usoCfdiFormCliente').val();
        // let middleName      = tipoRegimen != 'domestico' ? $('select#giroNegocioFormCliente').val() : "";
        let lastName     = $('input#apellidosFormCliente').val().trim();
        let rfc          = requiereFactura == 'si' ? $('input#rfcFormCliente').val() : "";
        let email        = $("input#correoFormCliente").val();
        let emailAlt     = $("input#correoAlternativoFormCliente").val();
        // let service      = $("select#tipoServicioFormCliente").val();
        // let typeService  = null;
        let regimenId    = null;

        if( tipoRegimen == 'industrial'){ regimenId = 1; }
        else if( tipoRegimen == 'domestico'){ regimenId = 3; }
        else if( tipoRegimen == 'comercial'){ regimenId = 5; }

        /*if( service == 'cilindro' ){ typeService = 1; }
        else if( service == 'estacionario' ){ typeService = 2; }
        else if( service == 'ambos' ){ typeService = 4; }*/

        let listAddress = [];
        let count = 1;
        
        for (let x = 0; x < $('table.table-address tbody').find(".address").length; x++) {
            let element = $($('table.table-address tbody').find(".address")[x]);
            let address = element.data('address');
            if( address.principal ) {
                address.tag = "00";
            } else {
                address.tag = "0"+count;
                count = count + 1;
            }
            element.data('address', address);
            listAddress.push(address);
        }

        let customer = {
            nombre : $('input#nombreFormCliente').val(),
            middleName : '',
            businessType : businessType,
            lastName : lastName,
            businessName: businessName,
            cfdi: cfdi,
            rfc : rfc,
            regimeType : regimenId != 3 ? false : true,
            // regimeType : tipoRegimen,
            email : email,
            emails : {
                principal : email,
                adicionales : emailAlt
            },
            planta : $('select#plantas').val(),
            telefono : $("input#telefonoPrincipalFormCliente").val(),
            telefonoAlt : $("input#telefonoAlternoFormCliente").val(),
            subsidiary : 25,// Seteado de forma estática
            regimenId : regimenId,
            notaCliente : $('#observacionesFormCliente').val(),
            //typeService : typeService,
            address : listAddress
        }
        console.log(customer);
        // return;
        loadMsg('Guardando información...');
        // Se envía la información del cliente por ajax
        let dataToSend = null;
        if ( idCliente ) {// Se actualiza

            let customerEdit = {
                firstname : customer['nombre'],
                lastname : customer['lastName'],
                custentity_ptg_giro_negocio : customer['businessType'],
                custentity_mx_rfc : customer['rfc'],
                custentity_disa_uso_de_cfdi_ : customer['cfdi'],
                companyname : customer['businessName'],
                email : customer['email'],
                custentity_drt_sed_email_invoice : emailAlt,
                // custentity_ptg_plantarelacionada_ : customer['planta'],
                phone : customer['telefono'],
                altphone : customer['telefonoAlt'],
                // subsidiary : customer['subsidiary'],
                custentity_ptg_tipodecliente_ : customer['regimenId'],
                custentity_ptg_notas_cliente_ : customer['notaCliente']
            }
            dataToSend = {
                "customers" : [
                    {
                        id : idCliente,
                        bodyFields : customerEdit,
                        bodyAddress : []
                    }
                ] 
            };

        } else {// Se crea uno nuevo
            let arrayCustomers = [];
            arrayCustomers.push(customer);
    
            dataToSend = {
                "customers" : arrayCustomers,
            };
        
        }
        
        let settings = {
            url    : urlGuardarCliente,
            method : idCliente ? 'PUT' : 'POST',
            data   : JSON.stringify(dataToSend),
        }
    
        setAjax(settings).then((response) => {
            infoMsg('success', 'Registro guardado exitósamente');
            searchCustomer(response.data[0]);
            clearCustomerForm('create');
            // let telefono = $('#telefonoPrincipalFormCliente').val();
            // $( "input#buscarCliente" ).val(telefono);
            // searchCustomer(telefono);
        }).catch((error) => {
            infoMsg('error', 'Algo salió mal en la creación del registro');
            console.log('Error en la consulta', error);
        });
    } else {
        if ( !$("input#idInternoFormCliente").val() && $('table.table-address tbody').find(".address").length == 0 ) {
            alert("Favor de colocar al menos una dirección");

        } else {
            alert("Favor de llenar todos los campos con *");
        }
    }
}

// Método para limpiar todos los campos del form de clientes
function clearCustomerForm(type = 'create') {
    $('table.table-address tbody').children('tr').remove();

    $('table.table-address tbody').append(
        '<tr>'+
            '<td class="text-center" colspan="3">Sin direcciones</td>'+
        '</tr>'
    );

    $(".dato-facturacion").addClass("d-none");
    $(".dato-regimen-moral").addClass("d-none");
    $(".dato-regimen-fisico").removeClass("d-none");

    // Limpia los textarea e inputs de todo el form
    $('#form-client-view').find('input.form-ptg[type="text"], input.form-ptg[type="time"], input.form-ptg[type="number"], textarea.form-ptg').val('');

    // Tab inicio
    $("input#tipoRegimen1").prop('checked', true);
    $("input#requiereFactura2").prop('checked', true);
    $("select#giroNegocioFormCliente").parent().addClass('d-none');

    // Tab contacto
    $("input#rfcFormCliente").parent().parent().addClass('d-none');
    $('#tab-client-contacto').find('select.form-ptg').each(function( index ) {
        $( this ).val($(this).children("option:first").val());
    });

    // Tab programación
    $('#form-client-view').find('[type="checkbox"]').prop('checked', false);
    $("input#tipoAccionFormClient1").prop('checked', true);

    // Aquí empieza
    $( "#btnBack" ).trigger( "click" );
    $("button.next-to-domicilio").parent().addClass('d-none');// Se esconde el botón de siguiente para visualizar la vista de domiciliod
    $("div.domicilio-tab").addClass('d-none');
}