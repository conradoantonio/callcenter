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

// Elimina el registro de una dirección antes de guardarla
$("button#guardarDireccion").click( function() {
    console.log('se eliminará la dirección');
});

// Método para validar los campos de una dirección
function validateAddressFields() {
    let val = $("#tipoAccionDireccion").val('lista');
    let canContinue = false;
    let timeUnix = moment().unix();
    let numAddress = $('table.table-address tbody').children('tr.address').length;

    if(
        !$("#estadoDireccion").val().trim()    ||
        !$("#municipioDireccion").val().trim() ||
        !$("#coloniaDireccion").val().trim()   ||
        !$("#cpDireccion").val().trim()        ||
        !$("#calleDireccion").val().trim()     ||
        !$("#exteriorDireccion").val().trim()  ||
        !$("#interiorDireccion").val().trim()  ||
        !$("#entre1Direccion").val().trim()    ||
        !$("#entre2Direccion").val().trim()    ||
        !$("#zonaVentaDireccion").val().trim() ||
        !$("#rutaDireccion").val().trim()
    ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if( canContinue ) {

        let address = getAddressOnList();
        
        // Si es la primera dirección que se agrega, se limpia el texto por defecto de la tabla
        if (! numAddress ) {
            $('table.table-address tbody').children('tr').remove();
        }

        $('table.table-address tbody').append(
            '<tr class="address" id="'+timeUnix+'" data-address="'+JSON.stringify(address.obj)+'">'+
                '<td>'+address.str+'</td>'+
                '<td class="text-center">'+
                    '<div class="text-center">'+
                        '<input class="form-check-input" type="checkbox" '+(!numAddress ? 'checked' : '')+' value="" id='+timeUnix+'>'+
                    '</div>'+
                '</td>'+
                '<td class="text-center">'+
                    '<button class="btn btn-sm btn-info delete-address"> <i class="fa fa-pen-to-square"></i> </button>'+
                '</td>'+
            '</tr>'
        )

        // Se hace un push a las direcciones del arreglo global
        listAddress.push(address.obj);

        // Marca como principal si es que es la única dirección existente
        if (! numAddress ) {
            // $('input#'+timeUnix).prop('checked', true);
        }
        $('div#formDireccionesModal').modal('hide');
    } else {
        alert("Favor de llenar todos los campos con *");
    }
}

// Coloca una dirección en el listado de direcciones del cliente
function getAddressOnList() {
    let addressStr = '';

    let addressObj = {
        principal   : "",
        stateName   : $("#estadoDireccion").val().trim(),
        city        : $("#municipioDireccion").val().trim(),
        zip         : $("#cpDireccion").val().trim(),
        nameStreet  : $("#calleDireccion").val().trim(),
        numExterno  : $("#exteriorDireccion").val().trim(),
        numInterno  : $("#interiorDireccion").val().trim(),
        colonia     : $("#coloniaDireccion").val().trim(),
        latitud     : "",
        longitud    : "",
        colonia     : $("#coloniaDireccion").val().trim(),
        street_aux1 : $("#entre1Direccion").val().trim(),
        street_aux1 : $("#entre2Direccion").val().trim(),
        zonaVenta   : $("#zonaVentaDireccion").val().trim(),
        ruta        : $("#rutaDireccion").val().trim(),
        idRoute     : $("#rutaDireccion").val().trim()
    }

    addressStr += addressObj['nameStreet'];
    addressObj['numExterno'] ? addressStr+= ' #'+addressObj['numExterno'] : '';
    addressObj['colonia']    ? addressStr+= ', Col. '+addressObj['colonia'] : '';
    addressObj['stateName']  ? addressStr+= ', '+addressObj['stateName'] : '';
    addressObj['city']       ? addressStr+= ', '+addressObj['city'] : '';
    addressObj['zip']        ? addressStr+= ', C.P. '+addressObj['zip'] : '';
    addressObj['zonaVenta']  ? addressStr+= '<br>Zona de venta: '+addressObj['zonaVenta'] : '';
    addressObj['ruta']       ? addressStr+= '<br>Ruta: '+addressObj['ruta'] : '';

    addressObj['domFacturacion'] = addressStr;
    return {
        str : addressStr,
        obj : addressObj
    };
}
// Guarda la información de un cliente en Netsuite
function saveCustomer(){
    let canContinue = false;
    if(
        !$("#cadaFormCliente").val().trim()                         ||
        !$("#frecuenciaFormCliente").val().trim()                   ||
        !$("#entreFormCliente").val().trim()                        ||
        !$("#lasFormCliente").val().trim()                          ||
        $("input[name=tipoAccionFormCliente]:checked").val().trim() ||
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
        let service         = $("input#tipoServicioFormCliente").val();
        let typeService     = null;
        let regimenId       = null;

        if( tipoRegimen == 'industrial'){ regimenId = 1; }
        else if( tipoRegimen == 'domestico'){ regimenId = 3; }
        else if( tipoRegimen == 'industrial'){ regimenId = 5; }

        if( service == 'cilindro' ){ typeService = 1; }
        else if( service == 'estacionario' ){ typeService = 2; }
        else if( service == 'ambos' ){ typeService = 4; }

        let customer = {
            nombre : $('input#nombreFormCliente').val(),
            middleName : middleName,
            lastName : lastName.trim(),
            rfc : rfc,
            regimeType : false,
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
            typeService : typeService,
            address : listAddress
        }
        console.log(customer);
    } else {
        alert("Favor de llenar todos los campos con *");
    }
}

// Guarda la información de un cliente
function saveCustomerPut() {
    let customStartTime = customEndTime = new Date();
    let yLas            = $("#lasFormCliente").val();
    let entreLas        = $("#entreFormCliente").val();
    let periodoContacto = $("select#frecuenciaFormCliente").val();
    let horaInicio      = entreLas.split(':');
    let horaFin         = yLas.split(':');
    let horaInicioStr = horaFinStr = "";

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
        custentity_ptg_cada_ : $("input#cadaFormCliente").val(),
        custentity_ptg_periododecontacto_ : periodoContacto,
        custentity_ptg_entrelas_ : horaInicioStr,
        custentity_ptg_ylas_ : horaFinStr,
        custentity_ptg_lunes_ : $("#lunesFormCliente").is(':checked'),
        custentity_ptg_martes_ :$("#martesFormCliente").is(':checked'),
        custentity_ptg_miercoles_ : $("#miercolesFormCliente").is(':checked'),
        custentity_ptg_jueves_ : $("#juevesFormCliente").is(':checked'),
        custentity_ptg_viernes_ : $("#viernesFormCliente").is(':checked'),
        custentity_ptg_sabado_ : $("#sabadoFormCliente").is(':checked'),
        custentity_ptg_domingo_ : $("#domingoFormCliente").is(':checked'),
        custentityptg_tipodecontacto_ : $("input[name=tipoAccionFormCliente]:checked").val(),
        custentity_ptg_indicaciones_cliente : $("#indicacionesFormCliente").val()
    }

    console.log(body);
}