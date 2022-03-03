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
        ($("#tipoServicioFormCliente").val() == "1" && (!$("#selectCapacidadTipoServicio").val() || !$("#selectCapacidadTipoServicio").val().trim())) ||
        ($("#tipoServicioFormCliente").val() != "1" && !$("#inputCapacidadTipoServicio").val().trim()) ||
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

            // Marca como principal si es que es la única dirección existente
            if (! numAddress ) {
                // $('input#'+timeUnix).prop('checked', true);
            }
            $('div#formDireccionesModal').modal('hide');
        } else if( tipoAccion == 'guardar' ) {
            let dataToSend = {
                id : customerGlobal.id,
                bodyFields : {
                    'custentity_ptg_indicaciones_cliente' : customerGlobal?.notasCustomer
                },
                bodyAddress : [address.obj]
            }

            loadMsg('Guardando dirección...');
            saveAddress(dataToSend);
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
                if($('table.table-address tbody').find(".address").length == 0) {
                    $('table.table-address tbody').append('<tr><td class="text-center" colspan="3">Sin direcciones</td></tr>');
                }
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
        domFacturacion  : $('table.table-address tbody').find(".address").length == 0 ? true : false,
        stateName       : $("#estadoDireccion").val().trim(),
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
        //zonaVenta     : $("#zonaVentaDireccion").val().trim(),
        ruta            : $("#rutaColoniaIdDireccion").val().trim(),
        idRoute         : $("#rutaIdDireccion").val().trim(),
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
        capacidad       : $("#tipoServicioFormCliente").val() == "1" ? parseInt($("#selectCapacidadTipoServicio").val()) : parseInt($("#inputCapacidadTipoServicio").val()),
        commentsAddress : $("#indicacionesFormCliente").val().trim(),
        tag             : ''
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

            if ( data.isSuccessful ) {
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
    if(
        //!$("#cadaFormCliente").val().trim()                         ||
        //!$("#frecuenciaFormCliente").val().trim()                   ||
        //!$("#entreFormCliente").val().trim()                        ||
        //!$("#lasFormCliente").val().trim()                          ||
        $('table.table-address tbody').find(".address").length == 0
    ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if ( canContinue ) {
        let tipoRegimen     = $("input[name=tipoRegimen]:checked").val();
        let requiereFactura = $("input[name=requiereFactura]:checked").val();
        let middleName      = tipoRegimen != 'domestico' ? $('input#giroNegocioFormCliente').val() : "";
        let lastName        = $('input#apellidoPaternoFormCliente').val()+' '+$('input#apellidoMaternoFormCliente').val();
        let rfc             = requiereFactura == 'si' ? $('input#rfcFormCliente').val() : "";
        let email           = $("input#correoFormCliente").val();
        let emailAlt        = $("input#correoAlternativoFormCliente").val();
        //let service         = $("select#tipoServicioFormCliente").val();
        //let typeService     = null;
        let regimenId       = null;

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
            if(address.principal) {
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
            middleName : middleName,
            lastName : lastName.trim(),
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
            subsidiaria : 16,// Seteado de forma estática
            regimenId : regimenId,
            //typeService : typeService,
            address : listAddress
        }
        console.log(customer);
        return;
        loadMsg('Guardando información...');
        saveCustomerAjax(customer);
    } else {
        if ( $('table.table-address tbody').find(".address").length == 0 ) {
            alert("Favor de colocar al menos una dirección");

        } else {
            alert("Favor de llenar todos los campos con *");
        }
    }
}

function saveCustomerAjax(customer) {
    let arrayCustomers = [];
    arrayCustomers.push(customer);

    let dataCustomer = {
        "customers" : arrayCustomers,
    };

    $.ajax({
        url: urlGuardarCliente,
        method: 'POST',
        data: JSON.stringify(dataCustomer),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
            console.log('Data: ', data);
            
            if ( data.isSuccessful ) {
                infoMsg('success', 'Cliente registrado exitósamente');
                clearCustomerForm('create');
            } else {
                swal.close();
                infoMsg('error', 'Cliente no creado', 'Revise que la información proporcionada sea la correcta')
            }

        }, error: function (xhr, status, error) {
            infoMsg('error', 'Algo salió mal en la creación del registro')
            console.log('Error en la consulta', xhr, status, error);
        }
    });
}

// Guarda la información de un cliente
function setCustomerBody(customerId) {
    let customStartTime = customEndTime = new Date();
    let yLas            = $("#lasFormCliente").val();
    let entreLas        = $("#entreFormCliente").val();
    //let periodoContacto = $("select#frecuenciaFormCliente").val();
    let horaInicio      = entreLas.split(':');
    let horaFin         = yLas.split(':');
    let horaInicioStr   = horaFinStr = "";

    if ( horaInicio.length ) {
        customStartTime.setHours(horaInicio[0]);
        customStartTime.setMinutes(horaInicio[1]);
        horaInicioStr = moment(customStartTime).format('hh:mm a');
        console.log('Hora inicio: '+ horaInicioStr);
    }

    if ( horaFin.length ) {
        customEndTime.setHours(horaFin[0]);
        customEndTime.setMinutes(horaFin[1]);
        horaFinStr = moment(customEndTime).format('hh:mm a');
        console.log('Hora fin: '+ horaFinStr);
    }

    let body = {
        //custentity_ptg_cada_ : parseInt( $("input#cadaFormCliente").val() ),
        //custentity_ptg_periododecontacto_ : parseInt( periodoContacto ),
        custentity_ptg_entrelas_ : horaInicioStr,
        custentity_ptg_ylas_ : horaFinStr,
        custentity_ptg_lunes_ : $("#lunesFormCliente").is(':checked'),
        custentity_ptg_martes_ :$("#martesFormCliente").is(':checked'),
        custentity_ptg_miercoles_ : $("#miercolesFormCliente").is(':checked'),
        custentity_ptg_jueves_ : $("#juevesFormCliente").is(':checked'),
        custentity_ptg_viernes_ : $("#viernesFormCliente").is(':checked'),
        custentity_ptg_sabado_ : $("#sabadoFormCliente").is(':checked'),
        custentity_ptg_domingo_ : $("#domingoFormCliente").is(':checked'),
        //custentityptg_tipodecontacto_ : parseInt( $("input[name=tipoAccionFormCliente]:checked").val() ),
        custentity_ptg_indicaciones_cliente : $("#indicacionesFormCliente").val()
    }

    let request = {
        id : customerId,
        bodyFields : body,
        bodyAddress : []
    }

    saveCustomerBody(request);
    console.log(body);
}

// Guarda los datos del body del cliente (Los datos del formulario de programación)
function saveCustomerBody(customer) {
    let arrayCustomers = [];
    arrayCustomers.push(customer)
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

            if ( data.isSuccessful ) {
                infoMsg('success', 'Cliente registrado exitósamente');
                clearCustomerForm('create');
            } else {
                infoMsg('error', 'Cliente no creado', 'Revise que la información proporcionada sea la correcta')
            }

        }, error: function (xhr, status, error) {
            infoMsg('error', 'Algo salió mal en la creación del registro')
            console.log('Error en la consulta', xhr, status, error);
        }
    });
}

// Método para limpiar todos los campos del form de clientes
function clearCustomerForm(type = 'create') {
    let telefono = $('#telefonoPrincipalFormCliente').val();

    $('table.table-address tbody').children('tr').remove();

    $('table.table-address tbody').append(
        '<tr>'+
            '<td class="text-center" colspan="3">Sin direcciones</td>'+
        '</tr>'
    );

    // Limpia los textarea e inputs de todo el form
    $('#form-client-view').find('input.form-ptg[type="text"], input.form-ptg[type="time"], input.form-ptg[type="number"], textarea.form-ptg').val('');

    // Tab inicio
    $("input#tipoRegimen1").prop('checked', true);
    $("input#requiereFactura1").prop('checked', true);
    $("input#giroNegocioFormCliente").parent().addClass('d-none');

    // Tab contacto
    $("input#rfcFormCliente").parent().addClass('d-none');
    $('#tab-client-contacto').find('select.form-ptg').each(function( index ) {
        $( this ).val($(this).children("option:first").val());
    });

    // Tab programación
    $('#form-client-view').find('[type="checkbox"]').prop('checked', false);
    $("input#tipoAccionFormClient1").prop('checked', true);

    // Aquí empieza
    $( "#btnBack" ).trigger( "click" );
    $( "input#buscarCliente" ).val(telefono);
    searchCustomer(telefono);
}